import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { Storage } from '@ionic/storage';
import { Observable, from } from 'rxjs';
import { publishLast, refCount, tap } from 'rxjs/operators';

import { News } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  // this service needs to be refactored and changed to webspace items service
  newsUrl = 'https://api.apiit.edu.my/webspace/news';  // json output
  slideshowUrl = 'https://api.apiit.edu.my/webspace/slideshow';  // json output

  constructor(public http: HttpClient, private network: Network, private storage: Storage) { }

  /**
   * GET: Request news feed
   *
   * @param refresh - force refresh (default: false)
   */
  get(refresh: boolean = true): Observable<News[]> {
    if (this.network.type !== 'none') {
      if (refresh) { // get from backend
        return this.http.get<News[]>(this.newsUrl).pipe(
          tap(news => refresh && this.storage.set('news-cache', news)),
          publishLast(), refCount());
      } else { // get from local storage
        return from(this.storage.get('news-cache'));
      }
    } else {
      return from(this.storage.get('news-cache'));
    }
  }

  /**
   * GET: Request slideshow items
   *
   * @param refresh - force refresh (default: false)
   */
  getSlideshow(refresh: boolean = true): Observable<any[]> {
    if (this.network.type !== 'none') {
      if (refresh) {
        return this.http.get<any[]>(this.slideshowUrl).pipe(
          tap(slideshowItems => refresh && this.storage.set('slideshow-cache', slideshowItems)),
          publishLast(), refCount());
      } else {
        return from(this.storage.get('slideshow-cache'));

      }
    } else {
      return from(this.storage.get('slideshow-cache'));
    }
  }

}
