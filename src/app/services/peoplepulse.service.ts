import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  PpCategory,
  PpFilterOptions,
  PpPostwMeta
} from 'src/app/interfaces';
// import { WsApiService } from './ws-api.service';
import { CasTicketService } from './cas-ticket.service';

@Injectable({
  providedIn: 'root',
})
export class PeoplepulseService {
  // TODO: change  once api is deployed
  private apiUrl = 'https://6tgcwjvkih.execute-api.ap-southeast-1.amazonaws.com/dev';
  private httpOptions = {
    headers: { 'Content-Type': 'application/json' },
  };

  constructor(private http: HttpClient, private cas: CasTicketService) {}

  getPosts(userId: string): Observable<PpPostwMeta> {
    // const options = {
      // attempts: 4,
      // auth: true,
      // caching: 'network-or-cache',
      // headers: {},
      // params: {},
      // timeout: 20000,
      // url: this.apiUrl,
      // withCredentials: false,
    // };
    // const opt = {
      // params: options.params,
      // withCredentials: options.withCredentials,
      // headers: options.headers
    // };
    return this.cas.getST(this.apiUrl).pipe(
      // switchMap(ticket => this.http.get<PpPostwMeta>(url, { params: { ticket } })
      switchMap(ticket => this.http.get<PpPostwMeta>(`${this.apiUrl}/post?user_id=${userId}&ticket=${ticket}`))
    );
  }

  getPostCategories(userId: string, staffId: string): Observable<PpCategory[]> {
    return this.cas.getST(this.apiUrl).pipe(
      switchMap(ticket =>
        this.http.get<PpCategory[]>(
          `${this.apiUrl}/post_category?user_id=${userId}&staff_id=${staffId}&ticket=${ticket}`))
    );
  }

  getUserPosts(userId: string): Observable<PpPostwMeta> {
    return this.cas.getST(this.apiUrl).pipe(
      switchMap(ticket => this.http.get<PpPostwMeta>(`${this.apiUrl}/user_post?user_id=${userId}&ticket=${ticket}`))
    );
  }

  postPost(userId: string, tag: string, postCategoryId: number, postContent: string): Observable<any> {
    return this.cas.getST(this.apiUrl).pipe(
      switchMap(ticket => {
        return this.http.post(`${this.apiUrl}/post?ticket=${ticket}`, {
          user_id: userId,
          tag,
          post_category_id: postCategoryId,
          post_content: postContent,
        }, this.httpOptions);
      })
    );
  }

  deletePost(userId: string, postId: number): Observable<any> {
    return this.cas.getST(this.apiUrl).pipe(
      switchMap(ticket => {
        return this.http.delete(`${this.apiUrl}/user_post?user_id=${userId}&post_id=${postId}&ticket=${ticket}`, this.httpOptions);
      })
    );
  }

  editPost(userId: string, staffId: string, postId: number, categoryId: number, postContent: string): Observable<any> {
    return this.cas.getST(this.apiUrl).pipe(
      switchMap(ticket => {
        return this.http.put(`${this.apiUrl}/user_post?ticket=${ticket}`, {
            user_id: userId,
            post_id: postId,
            staff_id: staffId,
            post_content: postContent,
            category_id: categoryId,
        }, this.httpOptions);
      })
    );
  }

  // FOR DEMO ONLY (REAL IMPLEMENTATION DETAILS IS IN BACKEND, SO FRONTEND JUST
  // SEND USER DETAILS TO PUT/PATCH/DELETE)
  // postPost(posts: PpPostwMeta) {
    // return this.http.put<PpPostwMeta>(`${this.apiUrl}/post`, posts, this.httpOptions);
  // }

  // deletePost(posts: PpPostwMeta) {
    // return this.http.put<PpPostwMeta>(`${this.apiUrl}/post`, posts, this.httpOptions);
  // }

  // editPost(posts: PpPostwMeta) {
    // return this.http.put<PpPostwMeta>(`${this.apiUrl}/post`, posts, this.httpOptions);
  // }
  // DEMO

}

@Injectable({
  providedIn: 'root',
})
export class PpFilterOptionsService {
  options = new BehaviorSubject<PpFilterOptions>(null);
  sharedOptions$ = this.options.asObservable();

  constructor() {
    let options = JSON.parse(localStorage.getItem('filter-options'));
    if (options === null) {
      options = {
        sortBy: 'Date',
        isSortedAsc: false,
        categories: [
          { name: 'Praise', selected: true },
          { name: 'Achievement', selected: true },
          { name: 'Welfare', selected: true },
          { name: 'Issue Escalation', selected: true },
          { name: 'Announcement', selected: true },
          { name: 'Help Request', selected: false },
        ],
        funcAreas: [
          { name: 'Centre of Technology and Innovation', selected: true },
          { name: 'CEO Office', selected: true },
          { name: 'Student Services and Marketing', selected: true },
          { name: 'School of Computing', selected: true },
          { name: 'Finance', selected: true },
          { name: 'Library', selected: true },
          { name: 'School of Media, Arts and Design', selected: true },
        ],
      };
    }
    this.options.next(options);
    localStorage.setItem('filter-options', JSON.stringify(options));
  }

  setOptions(newOptions: PpFilterOptions) {
    this.options.next(newOptions);
    localStorage.setItem('filter-options', JSON.stringify(newOptions));
  }
}
