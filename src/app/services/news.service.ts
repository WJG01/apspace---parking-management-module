import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, from } from 'rxjs';
import { publishLast, refCount, tap } from 'rxjs/operators';

import { News } from '../interfaces';
import { Network } from '@ionic-native/network/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  newsUrl = 'https://api.apiit.edu.my/webspace/news';  // json output

  constructor(public http: HttpClient, private network: Network, private storage: Storage) { }

  /**
   * GET: Request news feed
   *
   * @param refresh - force refresh (default: false)
   */
  get(refresh?: boolean): Observable<News[]> {
    if (this.network.type !== 'none') {
      const options = refresh ? { headers: { 'x-refresh': '' } } : {};
      return this.http.get<News[]>(this.newsUrl, options).pipe(
        tap(news => refresh && this.storage.set('news-cache', news)),
        publishLast(), refCount());
    } else {
      return from(this.storage.get('news-cache'));
    }
  }

}
