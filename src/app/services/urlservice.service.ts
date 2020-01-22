import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private url: string;
  constructor() {}

  public setUrl(url: string) {
    this.url = url;
  }

  public getUrl() {
    return this.url;
  }
}
