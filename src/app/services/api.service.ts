import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject, from, Observable, share, tap } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { IntakeListing } from '../interfaces';
import { ConfigurationsService } from './configurations.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  intakeAPI = 'https://api.apiit.edu.my/student/intake_listing';

  constructor(
    private http: HttpClient,
    private config: ConfigurationsService,
    private storage: Storage
  ) { }

  getIntakes(refresh?: boolean): Observable<IntakeListing[]> {
    if (this.config.connectionStatus) {
      const options = refresh ? { headers: { 'x-refresh': '' } } : {};
      return this.http.get<IntakeListing[]>(this.intakeAPI, options).pipe(
        tap(intakeList => refresh && this.storage.set('intakeList-cache', intakeList)),
        share({
          connector: () => new AsyncSubject(),
          resetOnError: false,
          resetOnComplete: false,
          resetOnRefCountZero: false,
        }));
    } else {
      return from(this.storage.get('intakeList-cache'));
    }
  }
}
