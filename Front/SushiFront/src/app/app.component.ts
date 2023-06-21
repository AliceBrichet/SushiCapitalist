import { Component, Input } from '@angular/core';
import { WebserviceService } from './webservice.service';
import { Palier, Product, World } from './world';
import { ProductComponent } from './product/product.component';
import { Orientation } from './my-progress-bar/my-progress-bar.component';
import { MaxLengthValidator } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'SushiFront';
  horizontal = Orientation.horizontal;
  world: World = new World();
  server = WebserviceService.server;
  serverImage = WebserviceService.serverImage;
  username : string | null = "Masteriz" + Math.floor(Math.random() * 10000);
  selectUnlock = true;
  selectAllUnlock = false;
  selectAngel = true;
  selectUpgradeAngel = false;
  badgeManagers = 0;
  badgeUpgrades = 0;
  qtmulti = '1';
  constructor(
    private service: WebserviceService,
    private snackBar: MatSnackBar,
    private form: FormsModule
  ) {
      this.username = localStorage.getItem("username");
      this.username ? this.service.setUser(this.username) : '';
      service.getWorld().then((world) => {
        this.world = world.data.getWorld;
      });
  }

  show(state: boolean, route: string) {
    const el = document.getElementById(route);
    if (state) {
      el?.classList.add('is-active');
    } else {
      el?.classList.remove('is-active');
    }
  }

  onUsernameChanged(event: Event)
  {
    let target = event.target as HTMLInputElement
    if (target) {
      this.username = target.value;
      this.service.setUser(this.username)
      localStorage.setItem("username", this.username);
    } 
  }

  onProductionDone(data: { producedQuantity: number; p: Product }) {
    this.world.money += data.p.revenu * data.producedQuantity * data.p.quantite;
    this.service.lancerProduction(data.p).catch(reason => console.log("erreur: " + reason) );
    this.checkBadge();
  }

  onPurchaseDone(cout: number, p: Product) {
    this.checkUnlocks(p);
    this.world.money -= cout;
    this.service.acheterQtProduit(p).catch(reason => console.log("erreur: " + reason) );
  }

  changeCommutateur() {
    switch (this.qtmulti) {
      default:
      case '1':
        this.qtmulti = '10';
        break;
      case '10':
        this.qtmulti = '100';
        break;
      case '100':
        this.qtmulti = 'Max';
        break;
      case 'Max':
        this.qtmulti = '1';
        break;
    }
  }

  hireManager(manager: Palier) {
    if (this.world.money >= manager.seuil) {
      this.world.money -= manager.seuil;
      manager.unlocked = true;
      this.world.products[manager.idcible].managerUnlocked = true;
      this.popMessage(
        'Le manager ' + manager.name + ' a été engagé avec succès!'
      );
      this.checkBadge();
      this.service.engagerManager(manager).catch(reason => console.log("erreur: " + reason) );
    } else {
      throw new Error(
        `Le monde ne possède pas assez d'argent pour engager ce manager`
      );
    }
  }

  purchaseCashUpgrade(upgrade: Palier) {
    if (this.world.money >= upgrade.seuil) {
      this.world.money -= upgrade.seuil;

      const product = this.world.products[upgrade.idcible];
      this.apply(product, upgrade, 'upgrade');

      this.popMessage("L'upgrade " + upgrade.name + ' a bien été acheté !');
      this.service.acheterCashUpgrade(upgrade).catch(reason => console.log("erreur: " + reason));
    }
  }

  apply(product: Product, palier: Palier, from: string) {
    if (palier.typeratio === 'gain') {
      product.revenu *= palier.ratio;
    } else if (palier.typeratio === 'vitesse') {
      product.vitesse /= palier.ratio;
      product.timeleft /= palier.ratio;
    }
    palier.unlocked = true;

    if(from === 'upgrade')
    {
      this.popMessage(
        "L'upgrade " + palier.name + " a été achetée avec succès!"
      );
    } else if(from === 'unlock')
    {
      this.popMessage(
        "L'unlock " + palier.name + " vient d'être débloqué!"
      );
    }
  }

  checkBadge() {
    const money = this.world.money;
    const managers = this.world.managers.filter(m =>
      m.seuil <= money &&
      m.unlocked === false)
    const upgrades = this.world.upgrades.filter(u =>
      u.seuil <= money &&
      u.unlocked === false)

    if(managers.length) {
      this.badgeManagers = 1;
    } else {
      this.badgeManagers = 0;
    }

    if(upgrades.length) {
      this.badgeUpgrades = 1;
    } else {
      this.badgeUpgrades = 0;
    }
  }

  checkUnlocks(p : Product) {
    let unlocks = p.paliers.filter(u => 
      u.seuil <= p.quantite &&
      u.unlocked === false
    )
    if(unlocks) {
        unlocks.forEach(u => this.apply(p, u, 'unlock'))
        //applyAllUnlocks(context)
    }
    console.log(p.revenu);
  }

  getUnlocks() {
    const products = this.world.products
    if((!products.length))
    {
      return;
    }
    const min = products.reduce((min, item) => {
        return min < item.quantite ? item.quantite : min
    }, products[0].quantite)
    let list : Palier[] = [];

    if(this.selectUnlock){
      products.forEach(p => {
        list = list.concat(p.paliers.filter(u =>
          p.quantite <= u.seuil &&
          u.unlocked === false
        ))
      })
    } else if(this.selectAllUnlock) {
      list = this.world.allunlocks.filter(a => 
        a.seuil >= min &&
        a.unlocked === false
    )
    }

    list.sort(function (a, b) {
      return a.seuil - b.seuil;
    });

    return list;
  }

  unlockManagement(type: string) {
      if(type === 'unlock') {
        this.selectUnlock = true;
        this.selectAllUnlock = false;
      } else if(type === 'all') {
        this.selectAllUnlock = true;
        this.selectUnlock = false;
      }
  }

  angelManagement(type: string) {
    if(type === 'reset') {
        this.selectAngel = true;
        this.selectUpgradeAngel = false;
      } else if(type === 'upgrade') {
        this.selectUpgradeAngel = true;
        this.selectAngel = false;
      }
  }


  popMessage(message: string): void {
    this.snackBar.open(message, '', { duration: 2000 });
  }
}
