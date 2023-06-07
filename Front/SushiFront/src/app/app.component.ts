import { Component } from '@angular/core';
import { WebserviceService } from './webservice.service';
import { Product, World } from './world';
import { ProductComponent } from './product/product.component';
const testphrase = 'coucou';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'SushiFront';
  world: World = new World();
  server = 'https://isiscapitalistgraphql.kk.kurasawa.fr/';
  testphrase = testphrase;
  constructor(private service: WebserviceService) {
    service.getWorld().then((world) => {
      this.world = world.data.getWorld;
    });
  }
}
