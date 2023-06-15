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
  coutNProduct = 0;
  worldMoney = 0;
  worldQtmulti = '';
  can = 'can';
  product: Product = new Product();
  multiplicateur = 0;
  buttonBuy = '';
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

  @Output() notifyPurchase: EventEmitter<number> = new EventEmitter<number>();

  startFabrication() {
    if (this.product.quantite > 0) {
      this.product.timeleft = this.product.vitesse;
      console.log(this.product);
      this.product.lastupdate = Date.now();
      this.run = true;
    }
  }

  ngOnInit() {
    setInterval(() => {
      this.calcScore();
      this.calcCoutN();
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
    const maxQuantity = Math.floor(
      Math.log(
        (-this.worldMoney / this.product.cout) * (1 - this.product.croissance) +
          1
      ) / Math.log(this.product.croissance)
    );
    return maxQuantity;
  }

  calcCoutN() {
    if (this.worldQtmulti != 'Max') {
      this.coutNProduct = 0;
      this.multiplicateur = parseInt(this.worldQtmulti);
    } else {
      this.multiplicateur = this.calcMaxCanBuy();
      this.can = 'can';
      //cout ok sauf pour max ...
    }
    this.coutNProduct =
      (this.product.cout *
        (1 - Math.pow(this.product.croissance, this.multiplicateur))) /
      (1 - this.product.croissance);
    if (this.coutNProduct <= this.worldMoney) this.can = 'can';
    else this.can = "can't";
    if (this.can == "can't") {
      this.buttonBuy = 'disabled';
    } else this.buttonBuy = '';
  }

  buyProduct() {
    this.product.quantite += this.multiplicateur;
    this.product.cout =
      this.product.cout *
      Math.pow(this.product.croissance, this.multiplicateur);
    this.notifyPurchase.emit(this.coutNProduct);
  }
}

/* this.coutNProduct =
        this.product.cout *
        Math.pow(this.product.croissance, this.multiplicateur); */
