import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  items = {};
  constructor() {
    this.items = {};
  }

  public newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  public has(key: any) {
    return key in this.items;
  }
  public set(key: any, value : any) {
    this.items[key] = value;
  }
  public get(key: any) {
    return this.items[key];
  }
  public delete(key: any) {

    if(this.has(key) ){
      delete this.items[key]
      return true;
    }
    return false;
  }

}
