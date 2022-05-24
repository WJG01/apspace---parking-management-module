import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PpCategory, PpFunctionalArea, PpPostwMeta } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root',
})
export class PeoplepulseService {
  private apiUrl = 'http://localhost:3001';
  private httpOptions = {
    headers: { 'Content-Type': 'application/json' },
  };

  constructor(private http: HttpClient) {}

  getPosts(): Observable<PpPostwMeta> {
    return this.http.get<PpPostwMeta>(`${this.apiUrl}/post`);
  }

  getPostCategories(): Observable<PpCategory[]> {
    return this.http.get<PpCategory[]>(`${this.apiUrl}/post_category`);
  }

  // categoryId for now is category_name
  // postPost(tag: string, categoryId: string, content: string) {
  // console.log(tag, categoryId, content)
  // this.http.put(`${this.apiUrl}/post/posts`, {
  // tag: tag,
  // post_category_id: categoryId,
  // post_content: content,
  // }, this.httpOptions)
  // }

  // FOR DEMO ONLY (REAL IMPLEMENTATION DETAILS IS IN BACKEND, SO FRONTEND JUST
  // SEND USER DETAILS TO PUT/PATCH/DELETE)
  postPost(posts: PpPostwMeta) {
    return this.http.put<PpPostwMeta>(`${this.apiUrl}/post`, posts, this.httpOptions);
  }

  deletePost(posts: PpPostwMeta) {
    return this.http.put<PpPostwMeta>(`${this.apiUrl}/post`, posts, this.httpOptions);
  }

  editPost(posts: PpPostwMeta) {
    return this.http.put<PpPostwMeta>(`${this.apiUrl}/post`, posts, this.httpOptions);
  }

  // DEMOO

  getFunctionalArea(): Observable<PpFunctionalArea[]> {
    return this.http.get<PpFunctionalArea[]>(`${this.apiUrl}/functionalarea`);
  }
}
