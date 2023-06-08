import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../world';
import { WebserviceService } from '../webservice.service';
import {
  MyProgressBarComponent,
  Orientation,
} from '../my-progress-bar/my-progress-bar.component';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  product: Product = new Product();
  server = WebserviceService.server;
  serverImage = WebserviceService.serverImage;
  orientation = Orientation.horizontal;
  progressBar = 0;
  @Input()
  set prod(value: Product) {
    this.product = value;
  }
  startFabrication() {
    if (this.product.quantite == 0) {
      this.product.timeleft = this.product.vitesse;
      this.product.lastupdate = Date.now();
    }
  }
  ngOnInit() {
    setInterval(() => {
      this.calcScore();
    }, 100);
  }

  calcProgress() {
    const timePassed = Date.now() - this.product.lastupdate;
    this.progressBar =
      ((this.product.vitesse - this.product.timeleft) / this.product.vitesse) *
      100;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  calcScore() {}
}
