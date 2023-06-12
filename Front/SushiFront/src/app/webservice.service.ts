import { Injectable } from '@angular/core';
import { createClient } from '@urql/core';
import { GET_WORLD } from './Graphrequests';

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
        "/graphql, fetchOptions: () => { return { headers: {'x-user': this.user},}; },",
    });
  }

  getWorld() {
    return this.createClient().query(GET_WORLD, {}).toPromise();
  }
}
