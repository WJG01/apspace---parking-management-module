import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable, switchMap, tap, timeout, catchError, throwError, from, of, retryWhen, concatMap, iif, delay, concat, EMPTY, NEVER, AsyncSubject, share } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { CasTicketService } from './cas-ticket.service';
import { ComponentService } from './component.service';
import { ConfigurationsService } from './configurations.service';

@Injectable({
  providedIn: 'root'
})
export class WsApiService {

  private apiUrl = 'https://api.apiit.edu.my';

  constructor(
    public http: HttpClient,
    public plt: Platform,
    public storage: Storage,
    private cas: CasTicketService,
    private component: ComponentService,
    private config: ConfigurationsService
  ) { }

  /**
   * GET: Request WS API with cache (mobile only) and error handling.
   *
   * Caching strategies inspired by https://serviceworke.rs/caching-strategies.html
   *
   * @param endpoint - <apiUrl><endpoint> for service, used for caching
   * @param options.attempts - number of retries (default: 4)
   * @param options.auth - authentication required (default: true)
   * @param options.caching - caching strategies (default: true)
   * @param options.headers - http headers (default: {})
   * @param options.params - additional request parameters (default: {})
   * @param options.timeout - request timeout (default: 10000)
   * @param options.url - url of web service (default: apiUrl)
   * @param options.withCredentials - request sent with cookies (default: false)
   * @return data observable
   */
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
        this.component.toastMessage(err.message, 'medium');

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

  /**
   * POST: Simple request WS API.
   *
   * @param endpoint - <apiUrl><endpoint> for service
   * @param options.auth - authentication required (default: true)
   * @param options.body - request body (default: null)
   * @param options.headers - http headers (default: {})
   * @param options.params - additional request parameters (default: {})
   * @param options.timeout - request timeout (default: 10000)
   * @param options.url - url of web service (default: apiUrl)
   * @param options.withCredentials - request sent with cookies (default: false)
   * @return data observable
   */
  post<T>(endpoint: string, options: {
    auth?: boolean,
    body?: any | null,
    headers?: HttpHeaders | { [header: string]: string | string[]; },
    params?: HttpParams | { [param: string]: string | string[]; },
    timeout?: number,
    withCredentials?: boolean,
    url?: string,
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

    return (!options.auth // always get ticket if auth is true
      ? this.http.post<T>(url, options.body, opt)
      : this.cas.getST(url.split('?').shift()).pipe( // remove service url params
        switchMap(ticket => this.http.post<T>(url, options.body, { ...opt, params: { ...opt.params, ticket } })),
      )
    ).pipe(
      catchError(this.handleClientError),
      timeout(options.timeout),
      share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })
    );
  }

  /**
   * PUT: Simple request WS API.
   *
   * @param endpoint - <apiUrl><endpoint> for service
   * @param options.auth - authentication required (default: true)
   * @param options.body - request body (default: null)
   * @param options.headers - http headers (default: {})
   * @param options.params - additional request parameters (default: {})
   * @param options.timeout - request timeout (default: 10000)
   * @param options.url - url of web service (default: apiUrl)
   * @param options.withCredentials - request sent with cookies (default: false)
   * @return data observable
   */
  put<T>(endpoint: string, options: {
    auth?: boolean,
    body?: any | null,
    headers?: HttpHeaders | { [header: string]: string | string[]; },
    params?: HttpParams | { [param: string]: string | string[]; },
    timeout?: number,
    url?: string,
    withCredentials?: boolean,
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

    return (!options.auth // always get ticket if auth is true
      ? this.http.put<T>(url, options.body, opt)
      : this.cas.getST(url.split('?').shift()).pipe( // remove service url params
        switchMap(ticket => this.http.put<T>(url, options.body, { ...opt, params: { ...opt.params, ticket } })),
      )
    ).pipe(
      catchError(this.handleClientError),
      timeout(options.timeout),
      share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })
    );
  }

  /**
   * DELETE: Simple request WS API.
   *
   * @param endpoint - <apiUrl><endpoint> for service
   * @param options.auth - authentication required (default: true)
   * @param options.headers - http headers (default: {})
   * @param options.params - additional request parameters (default: {})
   * @param options.timeout - request timeout (default: 10000)
   * @param options.url - url of web service (default: apiUrl)
   * @param options.withCredentials - request sent with cookies (default: false)
   * @return data observable
   */
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

    return (!options.auth // always get ticket if auth is true
      ? this.http.delete<T>(url, opt)
      : this.cas.getST(url.split('?').shift()).pipe( // remove service url params
        switchMap(ticket => this.http.delete<T>(url, { ...opt, params: { ...opt.params, ticket } })),
      )
    ).pipe(
      catchError(this.handleClientError),
      timeout(options.timeout),
      share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })
    );
  }

  /** Handle client error by rethrowing 4xx or return empty observable for 304. */
  private handleClientError(err: HttpErrorResponse): Observable<never> {
    if (400 <= err.status && err.status < 500) {
      return throwError(() => new Error(err.message));
    } else if (err.status === 304) {
      return EMPTY;
    } else {
      console.error('Unknown http error response', err);
      return NEVER;
    }
  }

  /** Toast and throw error observable when offline. */
  private handleOffline(): Observable<never> {
    this.component.toastMessage('You are now offline.', 'medium');
    return throwError(() => new Error('offline'));
  }
}
