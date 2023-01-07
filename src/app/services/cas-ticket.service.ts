import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, forkJoin, from, mergeMap, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Network } from '@capacitor/network';

import { Storage } from '@ionic/storage-angular';

import { Role } from '../interfaces';
import { ComponentService } from './component.service';

/**
 * CAS Authentication with fallback mechanism.
 *
 *          Authentication <--+
 *                            v               (post-login)
 * +-------------+          +--------+  - - - > +-------+  - - - > +---------+
 * | user:logout |          | getTGT |          | getST |          | Service |
 * +-------------+ <-x----- +--------+ <------- +-------+ <------- +---------+
 *         Invalid Credentials      Service Ticket     Session Expired
 *          (Observable.EMPTY)         Expired         (if applicable)
 */
@Injectable({
  providedIn: 'root'
})
export class CasTicketService {

  readonly casUrl = 'https://cas.apiit.edu.my';

  constructor(
    public http: HttpClient,
    public storage: Storage,
    public router: Router,
    private component: ComponentService
  ) { }

  /**
   * Check if user is authenticated against presence of tgt in storage.
   */
  async isAuthenticated(): Promise<boolean> {
    return this.storage.get('tgt').then(tgt => !!tgt);
  }

  /**
   * POST: request ticket-granting ticket from CAS and cache tgt and credentials
   * If username and password are not provided, use `cred` from storage and
   * logout and return EMPTY instead of throwing an error on failure.
   *
   * @param username CAS username
   * @param password CAS password
   */
  getTGT(username?: string, password?: string): Observable<string> {
    const options = {
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      observe: 'response' as 'body',
    };
    return (username && password
      ? of(new HttpParams().set('username', username).set('password', password).toString())
      : from(this.storage.get('cred'))
    ).pipe(
      switchMap(data => this.http.post(this.casUrl + '/cas/v1/tickets', data, options).pipe(
        catchError(res => res.status === 201 && res.headers.get('Location')
          ? of(res.headers.get('Location').split('/').pop())
          : username && password
            ? throwError(() => new Error(res))
            : (this.router.navigate(['/logout']), EMPTY)),
        tap(tgt => {
          // Resolve both Promises
          Promise.all([this.storage.set('tgt', tgt), this.storage.set('cred', data)]);
        })
      ))
    );
  }

  /**
   * POST: request service ticket from CAS
   * Use `tgt` from storage if not provided.
   *
   * @param serviceUrl Service url for CAS authentication
   * @param tgt Ticket granting ticket (default: cached `tgt`)
   */
  getST(serviceUrl: string = this.casUrl, tgt?: string | {}): Observable<string> {
    const options = {
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      params: { service: serviceUrl },
      responseType: 'text' as 'text', /* TODO: fix this in future angular */
      withCredentials: true,
    };

    return from(Network.getStatus()).pipe(
      switchMap(res => {
        if (!res.connected) {
          this.component.toastMessage('External links cannot be opened in offline mode. Please ensure you have a network connection and try again.', 'danger');
          return of('No Network');
        }

        return (tgt ? of(tgt) : from(this.storage.get('tgt'))).pipe(
          switchMap(tgt => this.http.post(`${this.casUrl}/cas/v1/tickets/${tgt}`, null, options)),
          catchError(err => err.status !== 0
            ? this.getTGT().pipe(switchMap(tgt => this.getST(serviceUrl, tgt)))
            : throwError(() => new Error('No network')))
        );
      })
    );
  }

  /**
   * DELETE: delete ticket granting ticket
   * Use `tgt` from storage if not provided.
   *
   * @param tgt Ticket granting ticket (default: cached `tgt`)
   */
  deleteTGT(tgt?: string): Observable<string> {
    const options = {
      responseType: 'text' as 'text',
      withCredentials: true,
    };
    return (tgt ? of(tgt) : from(this.storage.get('tgt'))).pipe(
      switchMap(tgt => this.http.delete(this.casUrl + '/cas/v1/tickets/' + tgt, options)),
    );
  }

  /**
   * GET: Validate service ticket and set role to user
   *
   * @param st Service ticket
   * @returns tgt Ticket granting ticket
   */
  validate(st?: string): Observable<Role> {
    const options = {
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      params: { format: 'json', service: this.casUrl, ticket: st },
      withCredentials: true,
    };

    return this.http.get<any>(this.casUrl + '/cas/p3/serviceValidate', options).pipe(
      switchMap(res => {
        const parts = res.serviceResponse.authenticationSuccess.attributes.distinguishedName
          .join().toLowerCase().split(',');
        let role: Role = 0;
        let canAccessResults = false;
        let canAccessPayslipFileSearch = false;

        if (parts.indexOf('ou=students') !== -1) {
          role |= Role.Student;
        }
        if (parts.indexOf('ou=academic') !== -1) {
          role |= Role.Lecturer;
        }
        if (parts.indexOf('ou=apiit tpm') !== -1) {
          role |= Role.Admin;
        }
        if (!role) {
          this.storage.clear();
          return throwError(() => new Error('Group not supported'));
        }

        if (res.serviceResponse.authenticationSuccess.attributes.memberOf) { // some users do not have memberOf attribute
          const memberOf = res.serviceResponse.authenticationSuccess.attributes.memberOf
            .join().toLowerCase().split(',');

          // const distinguishedName = res.serviceResponse.authenticationSuccess.attributes.distinguishedName
          //   .join().toLowerCase().split(',');

          canAccessResults = memberOf.includes('cn=gims_web_result'.toLowerCase());
          canAccessPayslipFileSearch = memberOf.includes('cn=ACL_EPAYSLIP_ADMIN'.toLowerCase());
        }

        // make sure storage tasks are done before returning
        return forkJoin([
          from(this.storage.set('role', role)),
          from(this.storage.set('canAccessResults', canAccessResults)),
          from(this.storage.set('canAccessPayslipFileSearch', canAccessPayslipFileSearch))
        ]).pipe(mergeMap(() => of(role)));
      }),
    );
  }
}
