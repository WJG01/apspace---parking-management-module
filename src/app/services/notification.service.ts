import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { catchError, from, map, NEVER, Observable, of, switchMap, tap, throwError } from 'rxjs';

import { Storage } from '@ionic/storage-angular';
import { Badge } from '@awesome-cordova-plugins/badge/ngx';

import { NotificationHistory, NotificationStatus, NotificationSubStatus } from '../interfaces';
import { ConfigurationsService } from './configurations.service';
import { CasTicketService } from './cas-ticket.service';
import { ComponentService } from './component.service';
import { FcmService } from './fcm.service';

// Local Storage Key
const NOTIFICATION_KEY = 'notifications-cache';
const CATEGORIES_KEY = 'dingdong-categories-cache';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  serviceUrl = 'http://sns-admin.s3-website-ap-southeast-1.amazonaws.com/';
  apiUrl = 'https://api.apiit.edu.my/dingdong'; // Prod URL
  headers = new HttpHeaders().set('version', 'v2');

  constructor(
    private config: ConfigurationsService,
    private platform: Platform,
    private cas: CasTicketService,
    private storage: Storage,
    private http: HttpClient,
    private component: ComponentService,
    private badge: Badge,
    private fcm: FcmService
  ) { }

  /**
   * GET: send token and service ticket on Log in and response is the history of notifications
   */
  getMessages(): Observable<NotificationHistory> {
    if (this.config.connectionStatus) {
      return from(of(1)).pipe(
        switchMap(() => {
          return this.cas.getST(this.serviceUrl);
        }),
        switchMap(st => {
          const url = `${this.apiUrl}/client/login?ticket=${st}`;

          return this.http.get<NotificationHistory>(url, { headers: this.headers }).pipe(
            tap(notifications => this.storage.set(NOTIFICATION_KEY, notifications))
          );
        })
      );
    } else {
      return from(this.storage.get(NOTIFICATION_KEY));
    }
  }

  /**
   * POST: send token and service ticket on Log out
   */
  sendTokenOnLogout() {
    let token = '';
    if (this.platform.is('capacitor')) {
      return from(this.fcm.getToken()).pipe(
        switchMap(
          responseToken => {
            token = responseToken;
            return this.cas.getST(this.serviceUrl);
          },
        ),
        switchMap(
          st => {
            const body = {
              device_token: token,
            };
            const url = `${this.apiUrl}/client/logout?ticket=${st}`;
            return this.http.post(url, body, { headers: this.headers });
          },
        ),
      );
    }
  }


  getCategories() {
    if (this.config.connectionStatus) {
      const url = `${this.apiUrl}/client/categories`;
      return this.http.get(url, { headers: this.headers }).pipe(
        map(c => c['categories']),
        tap(categories => this.storage.set(CATEGORIES_KEY, categories)),
        catchError(err => {
          if (400 <= err.status && err.status < 500) {
            this.component.toastMessage('Something happened while we get the categories.', 'danger');
            return throwError(() => new Error(err.message));
          } else {
            console.error('Unknown notification error', err);
            return NEVER;
          }
        })
      )
    } else {
      return from(this.storage.get(CATEGORIES_KEY));
    }
  }

  /**
   * POST: send message id and service ticket
   *
   * @param messageID id of the notification message
   */
  sendRead(messageID: number): Observable<any> {
    if (this.config.connectionStatus) {
      return this.cas.getST(this.serviceUrl).pipe(
        switchMap(st => {
          const body = {
            message_id: messageID
          };
          const url = `${this.apiUrl}/client/read?ticket=${st}`;

          return this.http.post(url, body, { headers: this.headers }).pipe(
            tap(() => {
              if (this.platform.is('capacitor')) {
                this.badge.decrease(1);
              }
            }),
            catchError(err => {
              if (400 <= err.status && err.status < 500) {
                this.component.toastMessage('Something happened while we get the message details.', 'danger');
                return throwError(() => new Error(err.message));
              } else {
                console.error('Unknown notification error', err);
                return NEVER;
              }
            })
          )
        })
      );
    }
  }

  getMessageDetail(messageID: any): Observable<any> {
    if (this.config.connectionStatus) {
      return this.cas.getST(this.serviceUrl).pipe(
        switchMap(st => {
          const url = `${this.apiUrl}/client/messages/${messageID}?ticket=${st}`;
          return this.http.get(url).pipe(
            catchError(err => {
              if (400 <= err.status && err.status < 500) {
                this.component.toastMessage('Something happened while we get the message details.', 'danger');
                return throwError(err.message);
              } else {
                console.error('Unknown notification error', err);
                return NEVER;
              }
            })
          );
        }),
      );
    } else {
      return from('network none');
    }
  }

  getSubscription(): Observable<NotificationStatus> {
    if (this.config.connectionStatus) {
      return this.cas.getST(this.serviceUrl).pipe(
        switchMap(st => {
          const url = `${this.apiUrl}/client/preferences/personal_email_subscription?ticket=${st}`;

          return this.http.get<NotificationStatus>(url).pipe(
            catchError(err => {
              if (400 <= err.status && err.status < 500) {
                this.component.toastMessage('Something happened while we were getting your request.', 'danger');
                return throwError(() => new Error(err.message));
              } else {
                console.error('Unknown notification error', err);
                return NEVER;
              }
            })
          );
        })
      );
    }
  }

  subscribe(): Observable<NotificationSubStatus> {
    if (this.config.connectionStatus) {
      return this.cas.getST(this.serviceUrl).pipe(
        switchMap(st => {
          const url = `${this.apiUrl}/client/preferences/personal_email_subscription?ticket=${st}`;

          return this.http.put<NotificationSubStatus>(url, { withCredentials: false }).pipe(
            catchError(err => {
              if (400 <= err.status && err.status < 500) {
                this.component.toastMessage('Your subscription request was not fulfilled. Please try again.', 'danger');
                return throwError(() => new Error(err.message));
              } else {
                console.error('Unknown notification error', err);
                return NEVER;
              }
            })
          );
        })
      );
    }
  }

  unsubscribe(): Observable<NotificationSubStatus> {
    if (this.config.connectionStatus) {
      return this.cas.getST(this.serviceUrl).pipe(
        switchMap(st => {
          const url = `${this.apiUrl}/client/preferences/personal_email_subscription?ticket=${st}`;

          return this.http.delete<NotificationSubStatus>(url).pipe(
            catchError(err => {
              if (400 <= err.status && err.status < 500) {
                this.component.toastMessage('Your subscription request was not fulfilled. Please try again.', 'danger');
                return throwError(() => new Error(err.message));
              } else {
                console.error('Unknown notification error', err);
                return NEVER;
              }
            })
          );
        })
      );
    }
  }
}
