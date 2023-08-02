import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, switchMap, tap, timeout, catchError, throwError, from, of, retryWhen, concatMap, iif, delay, concat, EMPTY, NEVER, AsyncSubject, share } from 'rxjs';
import { Platform } from '@ionic/angular';
import { ConfigurationsService } from './configurations.service';
import { ComponentService } from './component.service';
import { CasTicketService } from './cas-ticket.service';
import { Storage } from '@ionic/storage-angular';


@Injectable({
  providedIn: 'root'
})
export class ParkingWsApiService {

  // private apiUrl = 'https://f4h6o2no72.execute-api.us-east-1.amazonaws.com/prod';
  private apiUrl = 'https://i4qjljuc5c.execute-api.us-east-1.amazonaws.com/prod';


  constructor(
    public http: HttpClient,
    public plt: Platform,
    public storage: Storage,
    private config: ConfigurationsService,
    private component: ComponentService,
    private cas: CasTicketService,



  ) { }

  // Get all records
  getAllRecords() {
    const url = `${this.apiUrl}/parking-book`;
    return this.http.get(url);
  }

  get<T>(endpoint: string, options: {
    attempts?: number,
    auth?: boolean,
    caching?: 'network-or-cache' | 'cache-only' | 'cache-update-refresh',
    headers?: HttpHeaders | { [header: string]: string | string[]; },
    params?: HttpParams | { [param: string]: string | string[]; },
    timeout?: number,
    url?: string,
    withCredentials?: boolean
  } = {}): Observable<T> {
    options = {
      attempts: 4,
      auth: true,
      caching: 'network-or-cache',
      headers: {},
      params: {},
      timeout: 20000,
      url: this.apiUrl,
      withCredentials: false,
      ...options
    };

    const url = options.url + endpoint;
    const opt = {
      params: options.params,
      withCredentials: options.withCredentials,
      headers: options.headers
    };

    const request$ = (!options.auth // always get ticket if auth is true
      ? this.http.get<T>(url, opt)
      : this.cas.getST(url.split('?').shift()).pipe( // remove service url params
        switchMap(ticket => this.http.get<T>(url, { ...opt, params: { ...opt.params, ticket } })),
      )
    ).pipe(
      tap(cache => this.storage.set(endpoint, cache)),
      timeout(options.timeout),
      catchError(err => {
        if (400 <= err.status && err.status < 500) {
          return throwError(() => new Error(err));
        }

        return from(this.storage.get(endpoint)).pipe(
          switchMap(v => v ? of(v as T) : throwError(() => new Error(err))),
        );
      }),
      retryWhen(errors => errors.pipe(
        concatMap((err, n) => iif( // use concat map to keep errors in order (not parallel)
          () => !(400 <= err.status && err.status < 500) && n < options.attempts, // skip 4xx
          of(err).pipe(delay((2 ** (n + 1) + Math.random() * 8) * 1000)), // 2^n + random 0-8
          throwError(() => new Error(err)), // propagate error if all retries failed
        ))
      )),
    );

    if (!this.plt.is('capacitor')) { // disable caching on browser
      return request$;
    } else if (options.caching !== 'cache-only' && this.config.connectionStatus) {
      return options.caching === 'cache-update-refresh'
        ? concat(from(this.storage.get(endpoint)), request$)
        : request$;
    } else { // force request not cached
      return from(this.storage.get(endpoint)).pipe(
        switchMap(v => v ? of(v) : this.get<T>(endpoint, { ...options, caching: 'network-or-cache' })),
      );
    }

  }

  // Get record by APQParkingID
  getRecordById(APQParkingID: string) {
    const url = `${this.apiUrl}/record/${APQParkingID}`;
    return this.http.get(url);
  }

  // Create a new record
  createRecord(recordData: any) {
    const url = `${this.apiUrl}/parking-book`;
    return this.http.post(url, recordData);
  }

  //POST METHOD
  post<T>(endpoint: string, options: {
    auth?: boolean;
    body?: any | null;
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | string[] };
    timeout?: number;
    withCredentials?: boolean;
    url?: string;
  } = {}): Observable<T> {
    options = {
      auth: true,
      body: null,
      headers: {},
      params: {},
      timeout: 10000,
      url: this.apiUrl,
      withCredentials: false,
      ...options
    };

    const url = options.url + endpoint;
    const opt = {
      headers: options.headers,
      params: options.params,
      withCredentials: options.withCredentials,
    };

    if (this.plt.is('capacitor') && !this.config.connectionStatus) {
      return this.handleOffline();
    }

    console.log('Network Status: ', this.config.connectionStatus);

    return this.http.post<T>(url, options.body, opt);
  }


  //PUT METHOD
  put<T>(endpoint: string, options: {
    auth?: boolean;
    body?: any | null;
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | string[] };
    timeout?: number;
    url?: string;
    withCredentials?: boolean;
  } = {}): Observable<T> {
    options = {
      auth: true,
      body: null,
      headers: {},
      params: {},
      timeout: 10000,
      url: this.apiUrl,
      withCredentials: false,
      ...options
    };

    const url = options.url + endpoint;
    const opt = {
      headers: options.headers,
      params: options.params,
      withCredentials: options.withCredentials,
    };

    if (this.plt.is('capacitor') && !this.config.connectionStatus) {
      return this.handleOffline();
    }

    console.log('Network Status: ', this.config.connectionStatus);

    return this.http.put<T>(url, options.body, opt);
  }


  //DELETE METHOD
  delete<T>(endpoint: string, options: {
    auth?: boolean,
    headers?: HttpHeaders | { [header: string]: string | string[]; },
    params?: HttpParams | { [param: string]: string | string[]; },
    timeout?: number,
    url?: string,
    withCredentials?: boolean,
  } = {}): Observable<T> {
    options = {
      auth: true,
      headers: {},
      params: {},
      timeout: 10000,
      url: this.apiUrl,
      withCredentials: false,
      ...options
    };

    const url = options.url + endpoint;
    const opt = {
      headers: options.headers,
      params: options.params,
      withCredentials: options.withCredentials,
    };

    if (this.plt.is('capacitor') && !this.config.connectionStatus) {
      return this.handleOffline();
    }

    console.log('Network Status: ', this.config.connectionStatus);

    return this.http.delete<T>(url, opt);
  }

  // Update an existing record
  updateRecord(APQParkingID: string, recordData: any) {
    const url = `${this.apiUrl}/record/${APQParkingID}`;
    return this.http.put(url, recordData);
  }

  // Delete a record by APQParkingID
  deleteRecord(APQParkingID: string) {
    const url = `${this.apiUrl}/record/${APQParkingID}`;
    return this.http.delete(url);
  }

  /** Toast and throw error observable when offline. */
  private handleOffline(): Observable<never> {
    this.component.toastMessage('You are now offline.', 'medium');
    return throwError(() => new Error('offline'));
  }

}
