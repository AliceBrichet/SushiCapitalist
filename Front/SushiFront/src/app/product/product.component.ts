import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from '../world';
import { WebserviceService } from '../webservice.service';
// import { CountdownModule } from 'ngx-countdown';
import {
  MyProgressBarComponent,
  Orientation,
} from '../my-progress-bar/my-progress-bar.component';
import { AppComponent } from '../app.component';
import { BigvaluePipe } from '../bigvalue.pipe';
import { Injectable } from '@angular/core';
import { map, takeWhile, timer } from 'rxjs';

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
  producedQuantity = 0;
  maxQuantity = 0;
  coutNProduct = 0;
  worldMoney = 0;
  worldQtmulti = '';
  can = 'can';
  subtitle = '';
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
  @Output() notifyProduction: EventEmitter<{
    p: Product;
    producedQuantity: number;
  }> = new EventEmitter<{ p: Product; producedQuantity: number }>();

  @Output() notifyPurchase: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private service: WebserviceService,
  ) {}

  subtitles(): string {
    switch (this.product.name) {
      case 'Sashimi':
        this.subtitle = '刺身';
        break;
      case 'Maki':
        this.subtitle = 'マキ';
        break;
      case 'Sushi':
        this.subtitle = '寿司';
        break;
      case 'Miso':
        this.subtitle = 'みそ汁';
        break;
      case 'Onigiri':
        this.subtitle = 'おにぎり';
        break;
      case 'Plateau':
        this.subtitle = '高原';
        break;
      default:
        this.subtitle = '⋄⋄⋄⋄⋄⋄';
    }
    return this.subtitle;
  }

  startFabrication() {
    if (this.product.quantite > 0) {
      this.product.timeleft = this.product.vitesse;
      this.product.lastupdate = Date.now();
      this.run = true;
    }
  }
  ngOnInit() {
    setInterval(() => {
      this.calcScore();
      this.calcCoutN();
      // console.log(this.producedQuantity);
    }, 100);
  }
  calcScore() {
    if (!this.product) return;
    const currentTime = Date.now();
    let elapsedTime = currentTime - this.product.lastupdate;
    this.product.lastupdate = Date.now();
    this.producedQuantity = 0;
    if (this.product.timeleft != 0) {
      if (elapsedTime >= this.product.timeleft) {
        if (this.product.managerUnlocked == true) {
          console.log('timeleft ' + this.product.timeleft);
          console.log('elapsedtime' + elapsedTime);
          console.log('vitesse' + this.product.vitesse);
          elapsedTime -= this.product.timeleft;
          this.product.timeleft =
            this.product.vitesse - (elapsedTime % this.product.vitesse);
          this.producedQuantity =
            1 + Math.floor(elapsedTime / this.product.vitesse);
          console.log('Quantité produite' + this.producedQuantity);
          this.notifyProduction.emit({
            p: this.product,
            producedQuantity: this.producedQuantity,
          });
        } else {
          this.product.timeleft = 0;
          this.run = false;
          this.producedQuantity = 1;
          this.notifyProduction.emit({
            p: this.product,
            producedQuantity: this.producedQuantity,
          });
        }
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
    if (!this.product) return;
    //console.log(this.product);
    if (this.worldQtmulti != 'Max') {
      this.coutNProduct = 0;
      this.multiplicateur = parseInt(this.worldQtmulti);
    } else {
      this.multiplicateur = this.calcMaxCanBuy();
      this.can = 'can';
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
