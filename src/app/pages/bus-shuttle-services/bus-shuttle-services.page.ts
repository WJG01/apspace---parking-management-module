import { Component, OnInit } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';

import { parse } from 'date-fns';

import { TransixLocation, TransixScheduleSet, TransixScheduleTrip, Trips } from '../../interfaces';
import { SettingsService, WsApiService } from '../../services';
import { DateWithTimezonePipe } from '../../shared/date-with-timezone/date-with-timezone.pipe';

@Component({
  selector: 'app-bus-shuttle-services',
  templateUrl: './bus-shuttle-services.page.html',
  styleUrls: ['./bus-shuttle-services.page.scss'],
})
export class BusShuttleServicesPage implements OnInit {

  trips$: Observable<Trips[]>;
  locations$: Observable<TransixLocation[]>;
  todaysDate = new Date();
  latestUpdate: string;
  detailedView = false;
  filterObject = {
    toLocation: '',
    fromLocation: '',
    tripDay: this.getTodayDay(this.todaysDate)
  };
  skeletonConfig = {
    tripsSkeleton: new Array(2),
    timeSkeleton: new Array(4)
  };
  devUrl = 'https://2o7wc015dc.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(
    private ws: WsApiService,
    private dateWithTimezonePipe: DateWithTimezonePipe,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    if (this.settings.get('tripFrom')) {
      this.filterObject.fromLocation = this.settings.get('tripFrom');
    }
    if (this.settings.get('tripTo')) {
      this.filterObject.toLocation = this.settings.get('tripTo');
    }

    this.doRefresh();
  }

  doRefresh(refresher?) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    if (refresher) { // clear the filter data if user refresh the page
      this.filterObject = {
        fromLocation: '',
        toLocation: '',
        tripDay: this.getTodayDay(this.todaysDate),
      };
    }

    this.locations$ = this.ws.get<TransixLocation[]>('/v2/transix/locations', { url: this.devUrl, caching }).pipe(
      finalize(() => refresher && refresher.target.complete())
    );

    this.trips$ = this.ws.get<TransixScheduleSet>('/v2/transix/schedule/active', { url: this.devUrl, caching })
      .pipe(
        map(set => set.trips),
        map(trips => {
          // Map Trip Time into proper Date format
          trips
            .map(trip => trip.time = this.dateWithTimezonePipe.transform(parse(trip.time, 'HH:mm', new Date()), 'bus'));
          // Sort based on Time
          return trips
            .sort((a, b) => a.time.localeCompare(b.time));
        }),
        map(trips => {
          // Format to From Location -> { APU: TransixScheduleTrip[], LRT: TransixScheduleTrip[]... }
          const fromLocations = trips.reduce((prev: { [location: string]: TransixScheduleTrip[] }, current: TransixScheduleTrip) => {
            const fromLocation = current.trip_from.name;

            if (!prev[fromLocation]) {
              prev[fromLocation] = [current];
            } else {
              prev[fromLocation].push(current);
            }
            return prev;
          }, {});

          const formattedResponse: Trips[] = Object.keys(fromLocations).map(from => {
            // Format To Location -> { APU: TransixScheduleTrip[], LRT: TransixScheduleTrip[]... }
            const toLocations = fromLocations[from].reduce((prev: { [location: string]: TransixScheduleTrip[] }, current: TransixScheduleTrip) => {
              const toLocation = current.trip_to.name;

              if (!prev[toLocation]) {
                prev[toLocation] = [current];
              } else {
                prev[toLocation].push(current);
              }
              return prev;
            }, {});

            const formattedToLocation = Object.keys(toLocations).map(to => ({ trip_to: to, trips: toLocations[to] }));

            return {
              trip_from: from,
              trips: formattedToLocation
            };
          });

          return formattedResponse;
        }),
        tap(r => console.log(r))
      );
  }

  // Swap between from and to location
  swapLocations() {
    if (this.filterObject.fromLocation === this.filterObject.toLocation) return; // Prevent user from spamming the button if from and to location is the same
    // Prevent an issue where swap location wont work
    const oldToLocation = this.filterObject.toLocation;

    this.filterObject.toLocation = this.filterObject.fromLocation;
    this.filterObject.fromLocation = oldToLocation;
    this.doRefresh();
  }

  clearFilter() {
    this.filterObject = {
      fromLocation: '',
      toLocation: '',
      tripDay: this.getTodayDay(this.todaysDate),
    };
    this.doRefresh();
  }

  // GET DAY SHORT NAME (LIKE 'SAT' FOR SATURDAY)
  getTodayDay(date: Date) {
    const dayRank = date.getDay();
    if (dayRank === 0) {
      return 'sun';
    } else if (dayRank > 0 && dayRank <= 5) {
      return 'mon-fri';
    } else {
      return 'sat';
    }
  }
}
