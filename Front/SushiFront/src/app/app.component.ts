import { Component, Input } from '@angular/core';
import { WebserviceService } from './webservice.service';
import { Product, World } from './world';
import { ProductComponent } from './product/product.component';
import { Orientation } from './my-progress-bar/my-progress-bar.component';
import { MaxLengthValidator } from '@angular/forms';

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
  qtmulti = 'x 1';
  constructor(private service: WebserviceService) {
    service.getWorld().then((world) => {
      this.world = world.data.getWorld;
    });
  }

  showManagers(state: boolean) {
    const el = document.getElementById('managers');
    if (state) {
      el?.classList.add('is-active');
    } else {
      el?.classList.remove('is-active');
    }
  }

  onProductionDone(p: Product) {
    console.log(p);
    this.world.money += p.revenu;
  }

  changeCommutateur() {
    switch (this.qtmulti) {
      default:
      case 'x 1':
        this.qtmulti = 'x 10';
        break;
      case 'x 10':
        this.qtmulti = 'x 100';
        break;
      case 'x 100':
        this.qtmulti = 'Max';
        break;
      case 'Max':
        this.qtmulti = 'x 1';
        break;
    }
    console.log(this.qtmulti);
  }
}
