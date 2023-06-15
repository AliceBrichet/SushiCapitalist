import { Component, Input } from '@angular/core';
import { WebserviceService } from './webservice.service';
import { Palier, Product, World } from './world';
import { ProductComponent } from './product/product.component';
import { Orientation } from './my-progress-bar/my-progress-bar.component';
import { MaxLengthValidator } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  qtmulti = '1';
  constructor(private service: WebserviceService, private snackBar: MatSnackBar) {
    service.getWorld().then((world) => {
      this.world = world.data.getWorld;
    });
  }

  show(state: boolean, route: string) {
    let el = document.getElementById(route);
    if(state) {
      el?.classList.add('is-active');
    } else {
      el?.classList.remove('is-active');
    }
  }

  onProductionDone(p: Product) {
    this.world.money += p.revenu;
  }

  onPurchaseDone(cout: number) {
    console.log(cout);
    this.world.money -= cout;
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
    if(this.world.money >= manager.seuil) {
      this.world.money -= manager.seuil;
      manager.unlocked = true;
      this.world.products[manager.idcible].managerUnlocked = true;
      this.popMessage("Le manager "+manager.name+" a été engagé avec succès!");
    }
    else {
      throw new Error(
        `Le monde ne possède pas assez d'argent pour engager ce manager`
      )
    }
  }

  purchaseCashUpgrade(upgrade: Palier) {
    if(this.world.money >= upgrade.seuil) {
      this.world.money -= upgrade.seuil;

      let product = this.world.products[upgrade.idcible];
      this.apply(product, upgrade);

      this.popMessage("L'upgrade "+upgrade.name+" a bien été acheté !");
    }
  }

  apply(product : Product, palier: Palier) {
    if(palier.typeratio === 'gain') {
      product.revenu *= palier.ratio;
    }
    else if(palier.typeratio === 'vitesse') {
      product.vitesse /= palier.ratio
      product.timeleft /= palier.ratio
    }
    palier.unlocked = true;
  }

  getUnlocks() {
    const products = this.world.products;
    let list : Palier[]  = [];
  
    products.forEach(p => {
      list = list.concat(p.paliers.filter(u =>
        p.quantite <= u.seuil &&
        u.unlocked === false
      ))
    })

    list.sort(function(a,b) {
      return a.seuil - b.seuil;
    });

    return list;
  }

  getAllUnlocks() {
    const products = this.world.products
    const min = products.reduce((min, item) => {
        return min < item.quantite ? item.quantite : min
    }, products[0].quantite)

    const list = this.world.allunlocks.filter(a => 
        a.seuil >= min &&
        a.unlocked === false
    )

    list.sort(function(a,b) {
      return a.seuil - b.seuil;
    });

    return list;
  }

  //Gestion unlock : créer une liste des unlock et des allUnlocks pour les affichers dans 2 onglets différents

  popMessage(message : string) : void {
    this.snackBar.open(message, "", {duration : 2000})
  }
}
