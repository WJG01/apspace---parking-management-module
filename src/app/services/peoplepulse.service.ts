import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  PpCategory,
  PpFilterOptions,
  PpFunctionalArea,
  PpPostwMeta,
  PpStaff
} from 'src/app/interfaces';
// import { WsApiService } from './ws-api.service';
import { CasTicketService } from './cas-ticket.service';

@Injectable({
  providedIn: 'root',
})
export class PeoplepulseService {
  // TODO: change  once api is deployed
  // private apiUrl = 'https://6tgcwjvkih.execute-api.ap-southeast-1.amazonaws.com/dev/';
  private apiUrl = 'https://xbwck8xex7.execute-api.ap-southeast-1.amazonaws.com/dev';
  private httpOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : '*'
    },
  };

  constructor(private http: HttpClient, private cas: CasTicketService) {}

  getPosts(userId: string, page?: number): Observable<PpPostwMeta> {
    const url = `${this.apiUrl}/post`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => this.http.get<PpPostwMeta>(`${url}?user_id=${userId}&page=${page}&ticket=${ticket}`))
    );
  }

  getPostCategories(userId: string, staffId: string): Observable<PpCategory[]> {
    const url = `${this.apiUrl}/post_category`;
    return this.cas.getST(url).pipe(
      switchMap(ticket =>
        this.http.get<PpCategory[]>(
          `${url}?user_id=${userId}&staff_id=${staffId}&ticket=${ticket}`))
    );
  }

  getUserPosts(userId: string, page?: number): Observable<PpPostwMeta> {
    const url = `${this.apiUrl}/user_post`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => this.http.get<PpPostwMeta>(`${url}?user_id=${userId}&page=${page}&ticket=${ticket}`))
    );
  }

  getSearchUserPosts(userId: string, staffId: string, page?: number) {
    const url = `${this.apiUrl}/search_user`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => this.http.get<PpPostwMeta>(`${url}?user_id=${userId}&staff_id=${staffId}&page=${page}&ticket=${ticket}`))
    );
  }

  getFunctionalAreas(userId: string): Observable<PpFunctionalArea[]> {
    const url = `${this.apiUrl}/functional_area_id`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => this.http.get<PpFunctionalArea[]>(`${url}?user_id=${userId}&ticket=${ticket}`))
    );
  }

  getUsers(userId: string): Observable<PpStaff[]> {
    const url = `${this.apiUrl}/users`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => this.http.get<PpStaff[]>(`${url}?user_id=${userId}&ticket=${ticket}`))
    );
  }

  postPost(userId: string, tag: string, postCategoryId: number, postContent: string): Observable<any> {
    const url = `${this.apiUrl}/post`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => {
        return this.http.post(`${url}?ticket=${ticket}`, {
          user_id: userId,
          tag,
          post_category_id: postCategoryId,
          post_content: postContent,
        }, this.httpOptions);
      })
    );
  }

  deletePost(userId: string, postId: number): Observable<any> {
    const url = `${this.apiUrl}/user_post`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => {
        return this.http.delete(`${url}?user_id=${userId}&post_id=${postId}&ticket=${ticket}`, this.httpOptions);
      })
    );
  }

  editPost(userId: string, staffId: string, postId: number, categoryId: number, postContent: string): Observable<any> {
    const url = `${this.apiUrl}/user_post`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => {
        return this.http.put(`${url}?ticket=${ticket}`, {
            user_id: userId,
            post_id: postId,
            staff_id: staffId,
            post_content: postContent,
            category_id: categoryId,
        }, this.httpOptions);
      })
    );
  }

  editUserSettings(userId: string, staffId: string, status: boolean, accessLevel: boolean, adminAccess: boolean): Observable<any> {
    const url = `${this.apiUrl}/user_settings`;
    return this.cas.getST(url).pipe(
      switchMap(ticket => {
        return this.http.put(`${url}?ticket=${ticket}`, {
            user_id: userId,
            staff_id: staffId,
            status,
            access_level: accessLevel,
            admin_access: adminAccess,
        }, this.httpOptions);
      })
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class PpFilterOptionsService {
  options = new BehaviorSubject<PpFilterOptions>(null);
  sharedOptions$ = this.options.asObservable();

  constructor() {}

  init(functionalAreas) {
    const funcAreas = functionalAreas.map(i => ({name: i.functional_area, selected: true}));
    let options = JSON.parse(localStorage.getItem('filter-options'));
    if (options === null) {
      options = {
        // date-asc, date-desc, name-asc, name-desc
        sortBy: 'date-desc',
        categories: [
          { name: 'Praise', selected: true },
          { name: 'Achievement', selected: true },
          { name: 'Welfare', selected: true },
          { name: 'Issue Escalation', selected: true },
          { name: 'Announcement', selected: true },
          { name: 'Help Request', selected: true },
        ],
        funcAreas: [],
      };
    }
    if (options.funcAreas.length === 0) { options.funcAreas = funcAreas; }
    this.options.next(options);
    localStorage.setItem('filter-options', JSON.stringify(options));
  }

  setOptions(newOptions: PpFilterOptions) {
    this.options.next(newOptions);
    localStorage.setItem('filter-options', JSON.stringify(newOptions));
  }
}

@Injectable({
  providedIn: 'root',
})
export class PpInfiniteScrollService {
  public intersectionOptions = {
    root: null, // implies the root is the document viewport
    rootMargin: '0px',
    threshold: [0, 0.5, 1]
  };
  private intersectionSubject = new BehaviorSubject<boolean>(false);
  private observer: any = new IntersectionObserver(this.intersectionCallback.bind(this));


  getObservable() {
    return this.intersectionSubject.asObservable();
  }

  setObserver() {
    return this.observer;
  }

  intersectionCallback(entries) {
    entries.forEach(entry => {
      entry.intersectionRatio > 0
        ? this.intersectionSubject.next(true)
        : this.intersectionSubject.next(false);
    });
  }
}
