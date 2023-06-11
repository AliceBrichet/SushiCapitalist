import { Component } from '@angular/core';
import { WebserviceService } from './webservice.service';
import { Product, World } from './world';
import { ProductComponent } from './product/product.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'SushiFront';
  world: World = new World();
  server = WebserviceService.server;
  serverImage = WebserviceService.serverImage;
  constructor(private service: WebserviceService) {
    service.getWorld().then((world) => {
      this.world = world.data.getWorld;
    });
  }

  showManagers(state: boolean) {
    let el = document.getElementById("managers");
    if(state) {
      el?.classList.add('is-active');
    }
    else {
      el?.classList.remove('is-active');
    }
  }
    
}
