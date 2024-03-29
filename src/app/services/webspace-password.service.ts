import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

import { CasTicketService } from './cas-ticket.service';

@Injectable({
  providedIn: 'root'
})
export class WebspacePasswordService {

  url = 'https://api.apiit.edu.my/webspace-id';

  constructor(
    private cas: CasTicketService,
    private http: HttpClient
  ) { }

  changePassword(body: { current: string, new: string }) {
    const formBody = new HttpParams().set('new', body.new).set('current', body.current);

    return this.cas.getST(`${this.url}/change`).pipe(
      switchMap(ticket => {
        return this.http.post(
          `${this.url}/change?ticket=${ticket}`,
          formBody.toString(),
          { headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded') }
        );
      })
    );
  }

  resetPassword(passportNumber: string): Observable<any> {
    const formBody = new HttpParams().set('passport', passportNumber);

    return this.cas.getST(`${this.url}/reset`).pipe(
      switchMap(ticket => {
        return this.http.post(
          `${this.url}/reset?ticket=${ticket}`,
          formBody.toString(),
          { headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded') }
        );
      })
    );
  }
}
