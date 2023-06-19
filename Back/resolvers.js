const { time } = require('console');
const { products } = require('./world');
const fs = require('fs')

function saveWorld(context) {
    var fs = require('fs')
    context.world.money = calcScore(context),
    context.world.lastupdate = Date.now(),
    fs.writeFile("userworlds/" + context.user + "-world.json",
    JSON.stringify(context.world), err => {
        if (err) {
            console.error(err)
            throw new Error(`Erreur d'écriture du monde coté serveur`)
        }
    })
}

function calcScore(context) {
    const products = context.world.products
    const timePassed = Date.now() - context.world.lastupdate
    let money = context.world.money
    products.forEach(p => {
        if(p.timeleft !== 0) {
            if(p.managerUnlocked === false) {
                if(p.timeleft <= timePassed) {
                    money += p.revenu * p.quantite
                    p.timeleft = 0
                } else {
                    p.timeleft -= timePassed
                }
            } else {
                if(p.timeleft <= timePassed) {
                    money += 1 + (p.revenu * ((timePassed-p.timeleft)/p.vitesse)) * p.quantite
                    p.timeleft = p.vitesse - (timePassed % p.vitesse)
                }
                else {
                    p.timeleft -= timePassed
                }
            }
        }
    });
    return money;
}

function applyUnlock(product, unlock) {
    if(unlock.typeratio === 'gain') {
        product.revenu *= unlock.ratio
    }
    else if(unlock.typeratio === 'vitesse') {
        product.vitesse /= unlock.ratio
        product.timeleft /= unlock.ratio
    }
    unlock.unlocked = true
}

function checkUnlocks(context, p) {
    unlocks = p.paliers.filter(u => 
        u.seuil <= p.quantite &&
        u.unlocked === false
    )

    if(unlocks.length) {
        unlocks.forEach(u => applyUnlock(p, u))
        applyAllUnlocks(context)
    }
}

function applyAllUnlocks(context) {
    const products = context.world.products
    const min = products.reduce((min, item) => {
        return min < item.quantite ? item.quantite : min
    }, products[0].quantite)

    const allUnlocks = context.world.allunlocks.filter(a => 
        a.seuil >= min
    )

    products.forEach(p => 
        allUnlocks.forEach(u => 
            applyUnlock(p, allUnlocks)
        )
    )
    
    return min
}

module.exports = {
    Query: {
        getWorld(parent, args, context) {
            saveWorld(context)
            return context.world
        },
    },
    Mutation: {
        acheterQtProduit(parent, args, context) {
            const p = context.world.products.find(p => p.id === args.id)
            if(!p) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`
                )
            }
            p.quantite=args.quantite
            checkUnlocks(context, p)
            context.world.money-=p.cout
            p.cout = p.cout*p.croissance
            saveWorld(context)
            return p;
        },

        lancerProductionProduit(parent, args, context) {
            const p = context.world.products.find(p => p.id === args.id)
            if(!p) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`
                )
            }
            p.timeleft = p.vitesse
            saveWorld(context)
            return p;
        },

        engagerManager(parent, args, context) {
            const m = context.world.managers.find(m => m.name === args.name)
            if(!m) {
                throw new Error(
                    `Le manager avec le nom ${args.name} n'existe pas`
                )
            }
            const p = context.world.products.find(p => p.id === m.idcible)
            if(!p) {
                throw new Error(
                    `Le produit avec l'id ${args.id} n'existe pas`
                )
            }
            m.unlocked = true
            p.managerUnlocked = true
            context.world.money -= m.seuil
            saveWorld(context)
            return m;
        },

        acheterCashUpgrade(parent, args, context) {
            const u = context.world.upgrades.find(u => u.name === args.name)
            const p = context.world.products.find(p => p.id === u.idcible)
            if(!u) {
                throw new Error(
                    `L'upgrade avec le nom ${args.name} n'existe pas`
                )
            }
            u.unlocked = true
            applyUnlock(p,u)
            context.world.money -= u.seuil
            saveWorld(context)
            return u;
        },
    }
};