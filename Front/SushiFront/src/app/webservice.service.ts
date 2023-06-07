import { Injectable } from '@angular/core';
import { createClient } from '@urql/core';
import { GET_WORLD } from './Graphrequests';

@Injectable({
  providedIn: 'root',
})
export class WebserviceService {
  static getWorld: any;
  //constructor() {}
  //server = 'https://studio.apollographql.com/sandbox/explorer';
  server = 'https://isiscapitalistgraphql.kk.kurasawa.fr/graphql';
  //'http://localhost:4000/';
  user = '';

  createClient() {
    return createClient({
      url:
        this.server +
        "/graphql, fetchOptions: () => { return { headers: {'x-user': this.user},}; },",
    });
  }

  getWorld() {
    return this.createClient().query(GET_WORLD, {}).toPromise();
  }
}
