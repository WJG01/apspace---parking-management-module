import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, map, Observable, switchMap, tap } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { ImageSource, News } from '../interfaces';
import { ConfigurationsService } from './configurations.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  // TODO this service needs to be refactored and changed to webspace items service
  studentNewsUrl = 'https://api.apiit.edu.my/apspace/student';  // json output
  staffNewsUrl = 'https://api.apiit.edu.my/apspace/staff'; // json output
  studentSlideshowUrl = 'https://api.apiit.edu.my/apspace/student/slideshow';  // json output
  staffSlideshowUrl = 'https://api.apiit.edu.my/apspace/staff/slideshow';  // json output
  allNewsUrl = 'https://api.apiit.edu.my/apspace/'; // json output, news and slideshow
  mediaUrl = 'https://api.apiit.edu.my/apspace/media';

  constructor(
    private http: HttpClient,
    private network: ConfigurationsService,
    private storage: Storage
  ) { }

  /**
   * GET: Request news feed
   *
   * Default link will return news and slides for both, student and staff.
   * Use optional params to specify the role.
   * Role based news will return news without slideshow (eg. if (isStudent) {return news only}
   * @param refresh - force refresh (default: false)
   * @param isStudent? - true if student (optional)
   * @param isStaff? - true if staff (optional)
   */
  get(refresh: boolean = true, isStudent?: boolean, isStaff?: boolean): Observable<News[]> {
    if (!this.network.connectionStatus || !refresh) {
      return from(this.storage.get('news-cache'));
    }

    if (isStudent) {
      return this.getNewsWithImages(refresh, this.studentNewsUrl);
    } else if (isStaff) {
      return this.getNewsWithImages(refresh, this.staffNewsUrl);
    } else {
      return this.getNewsWithImages(refresh, this.allNewsUrl);
    }
  }

  private getNewsWithImages(refresh: boolean, url: string): Observable<News[]> {
    let images: ImageSource[];

    return this.getNewsImages().pipe(
      switchMap(res => {
        images = res;
        return this.http.get<News[]>(url) as Observable<News[]>;
      }),
      map(news => {
        news.forEach(n => {
          const featuredMediaImageArray = images.filter(i => i.id === n.featured_media);
          if (featuredMediaImageArray.length > 0) {
            n.featured_media_source = featuredMediaImageArray;
          } else {
            n.featured_media_source = [{ source_url: 'assets/img.placeholder.png' }];
          }
        });
        images = [];
        return news;
      }),
      tap(news => refresh && this.storage.set('news-cache', news))
    );
  }

  private getNewsImages(): Observable<ImageSource[]> {
    return this.http.get<ImageSource[]>(this.mediaUrl);
  }

  /**
   * GET: Request slideshow items
   *
   * Default link will return news and slides for both, student and staff.
   * Use optional params to specify the role.
   * Role based news will return news without slideshow (eg. if (isStudent) {return news only}
   * @param refresh - force refresh (default: false)
   * @param isStudent? - true if student (optional)
   * @param isLecturer? - true if staff (optional)
   */
  getSlideshow(refresh: boolean = true, isStudent?: boolean, isLecturer?: boolean): Observable<any[]> {
    if (this.network.connectionStatus) {
      if (refresh) {
        if (isStudent) {
          return this.getSlideshowWithImages(refresh, this.studentSlideshowUrl);
        } else if (isLecturer) {
          return this.getSlideshowWithImages(refresh, this.staffSlideshowUrl);
        } else {
          return this.getSlideshowWithImages(refresh, this.allNewsUrl);
        }
      } else {
        return from(this.storage.get('slideshow-cache'));
      }
    } else {
      return from(this.storage.get('slideshow-cache'));
    }
  }

  private getSlideshowWithImages(refresh: boolean, url: string): Observable<any[]> {
    let images: ImageSource[];
    return this.getNewsImages().pipe(
      switchMap(res => {
        images = res;
        return this.http.get<any[]>(url) as Observable<any[]>;
      }),
      map(slideshowItems => {
        slideshowItems.forEach(n => {
          const featuredMediaImageArray = images.filter(i => i.id === n.featured_media);
          if (featuredMediaImageArray.length > 0) {
            n.featured_media_source = featuredMediaImageArray;
          } else {
            n.featured_media_source = [{ source_url: 'assets/img/placeholder.png' }];
          }
        });
        images = [];
        return slideshowItems;
      }),
      tap(slideshowItems => refresh && this.storage.set('slideshow-cache', slideshowItems)),
    );
  }
}
