import { Injectable } from '@angular/core';
import { createClient } from '@urql/core';
import { ACHETER_CASH_UPGRADE, ENGAGER_MANAGER, GET_WORLD } from './Graphrequests';
import { Palier, Product } from './world';
import { LANCER_PRODUCTION } from './Graphrequests';
import { ACHETER_QT_PRODUIT } from './Graphrequests';

@Injectable({
  providedIn: 'root',
})
export class WebserviceService {
  static getWorld: any;
  static server = 'http://localhost:4000/graphql/';
  static serverImage = 'http://localhost:4000/';
  user = '';

  createClient() {
    return createClient({
      url:
        WebserviceService.server +
        "/graphql", fetchOptions: () => { return { headers: {'x-user': this.user},}; },
    });
  }

  setUser(username: string) {
    this.user = username;
  }

  getWorld() {
    return this.createClient().query(GET_WORLD, {}).toPromise();
  }

  lancerProduction(product: Product) { 
    return this.createClient().mutation(LANCER_PRODUCTION, {
      id: product.id}).toPromise(); 
  }

  acheterQtProduit(product: Product) { 
    return this.createClient().mutation(ACHETER_QT_PRODUIT, {
      id: product.id, quantite: product.quantite}).toPromise(); 
  }

  engagerManager(manager: Palier) { 
    return this.createClient().mutation(ENGAGER_MANAGER, {
      name : manager.name}).toPromise(); 
  }

  acheterCashUpgrade(upgrade: Palier) { 
    return this.createClient().mutation(ACHETER_CASH_UPGRADE, {
      name : upgrade.name}).toPromise(); 
  }

}