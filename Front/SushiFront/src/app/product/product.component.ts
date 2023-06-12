import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from '../world';
import { WebserviceService } from '../webservice.service';
import {
  MyProgressBarComponent,
  Orientation,
} from '../my-progress-bar/my-progress-bar.component';
import { AppComponent } from '../app.component';
import { BigvaluePipe } from '../bigvalue.pipe';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  server = WebserviceService.server;
  serverImage = WebserviceService.serverImage;
  orientation = Orientation.horizontal;
  run = false;
  maxQuantity = 0;
  worldMoney = 0;
  worldQtmulti = '';
  productQtmulti = 1;
  can = 'can';
  product: Product = new Product();
  multiplicateur = 0;
  @Input()
  set prod(value: Product) {
    this.product = value;
  }
  _qtmulti!: string;
  @Input() set qtmulti(value: string) {
    this.worldQtmulti = value;
    if (this.qtmulti && this.product) this.calcMaxCanBuy();
  }
  _money!: number;
  @Input() set money(value: number) {
    this.worldMoney = value;
  }
  @Output() notifyProduction: EventEmitter<Product> =
    new EventEmitter<Product>();

  startFabrication() {
    if (this.product.quantite >= 0) {
      this.product.timeleft = this.product.vitesse;
      console.log(this.product);
      this.product.lastupdate = Date.now();
      this.run = true;
    }
  }

  ngOnInit() {
    setInterval(() => {
      this.calcScore();
      this.calcBuyX();
    }, 100);
  }

  calcScore() {
    if (!this.product) return;
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.product.lastupdate;
    if (this.product.timeleft != 0) {
      if (elapsedTime >= this.product.timeleft) {
        this.product.quantite += 1;
        this.product.timeleft = 0;
        this.run = false;
        this.notifyProduction.emit(this.product);
        // ne gère pas encore le calc pour manager unlock
      } else {
        this.product.timeleft = this.product.timeleft - elapsedTime;
        this.product.lastupdate = currentTime;
      }
    }
  }
  calcMaxCanBuy() {
    let remainingMoney = this.worldMoney;
    this.maxQuantity = 0;
    while (remainingMoney >= this.product.cout) {
      this.maxQuantity++;
      remainingMoney -= this.product.cout;
      this.product.cout *= this.product.croissance;
    }
    return this.maxQuantity;
  }

  calcBuyX() {
    if (!this.product) return;
    const multiplicateur = parseInt(this.qtmulti, 10);
    console.log(multiplicateur);
    if (this.qtmulti === 'Max') {
      this.multiplicateur = this.calcMaxCanBuy();
      this.can = 'can';
    }
    if (this.qtmulti === 'x 1') {
      if (
        this.worldMoney >=
        this.product.cout * (this.product.croissance ^ multiplicateur)
      ) {
        this.can = "can't";
      }
    }
  }
}
