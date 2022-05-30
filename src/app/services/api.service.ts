import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject, from, map, Observable, share, tap } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { APULocation, APULocations, IntakeListing, LecturerTimetable, MappedLecturerTimetable } from '../interfaces';
import { ConfigurationsService } from './configurations.service';
import { WsApiService } from './ws-api.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  intakeAPI = 'https://api.apiit.edu.my/student/intake_listing';

  constructor(
    private http: HttpClient,
    private config: ConfigurationsService,
    private storage: Storage,
    private ws: WsApiService
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

  getLecturerTimetable(id: string, lastDateOfWeekZero: number, secondsPerWeek: number, secondsPerDay: number): Observable<MappedLecturerTimetable[]> {
    return this.ws.get<LecturerTimetable[]>(`/lecturer-timetable/v2/${id}`, { auth: false }).pipe(
      map(timetables => timetables.reduce((acc, d) => {
        const time = new Date(d.time);

        // unique week - subtract from week zero (-1ms to exclude 0000ms)
        const week = Math.floor((time.getTime() - lastDateOfWeekZero - 1) / secondsPerWeek);

        acc[week] = (acc[week] || []).concat({
          type: 'lecturerTimetable',
          module: d.module,
          start: time,
          end: time.getTime() + d.duration * 1000,
          location: `${d.room} ${d.location}`,
          intakes: d.intakes
        });

        return acc;
      }, {})),
      map(timetables => Object.keys(timetables).map(week => {
        const startWeekDate = new Date(+week * secondsPerWeek + lastDateOfWeekZero + secondsPerDay);

        return {
          week: startWeekDate,
          timetables: timetables[week]
        }
      }).reverse() // Sort Array by Latest Weeks
      ));
  }

  getLocations(refresher: boolean): Observable<APULocation[]> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    return this.ws.get<APULocations>(`/transix/locations`, { auth: false, caching }).pipe(
      map((res: APULocations) => res.locations)
    );
  }
}
