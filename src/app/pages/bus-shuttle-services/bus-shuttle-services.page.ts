import { Component, OnInit } from '@angular/core';
import { finalize, forkJoin, map, Observable, tap } from 'rxjs';

import { parse, parseISO, format, max } from 'date-fns';

import { APULocation, APULocations, BusTrip, BusTrips } from '../../interfaces';
import { SettingsService, WsApiService } from '../../services';
import { DateWithTimezonePipe } from '../../shared/date-with-timezone/date-with-timezone.pipe';

@Component({
  selector: 'app-bus-shuttle-services',
  templateUrl: './bus-shuttle-services.page.html',
  styleUrls: ['./bus-shuttle-services.page.scss'],
})
export class BusShuttleServicesPage implements OnInit {

  trip$: Observable<any>;
  locations: APULocation[];
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
    if (refresher) { // clear the filter data if user refresh the page
      this.filterObject = {
        fromLocation: '',
        toLocation: '',
        tripDay: this.getTodayDay(this.todaysDate),
      };
    }

    this.trip$ = forkJoin([this.getLocations(refresher), this.getTrips(refresher)]).pipe(
      map(res => res[1]),
      map(trips => {
        let filteredArray = trips.filter(trip => {
          // FILTER TRIPS BY (FROM, TO) LOCATIONS, AND DAY
          if (this.filterObject.tripDay === 'mon-fri') {
            return (
              trip.trip_from.includes(this.filterObject.fromLocation) &&
              trip.trip_to.includes(this.filterObject.toLocation) &&
              (trip.trip_day === 'mon-fri' || trip.trip_day === 'fri')
            );
          } else {
            return (
              trip.trip_from.includes(this.filterObject.fromLocation) &&
              trip.trip_to.includes(this.filterObject.toLocation) &&
              trip.trip_day === this.filterObject.tripDay
            );
          }
        });
        if (!this.detailedView) {
          filteredArray = filteredArray.filter(trip => {
            // FILTER TRIPS TO UPCOMING TRIPS ONLY
            const timeFormat = this.settings.get('timeFormat');
            const timeFilter = timeFormat === '24' ?
              parse(trip.trip_time.replace(' (GMT+8)', ''), 'HH:mm', new Date()) >= this.todaysDate :
              parse(trip.trip_time.replace(' (GMT+8)', ''), 'hh:mm aa', new Date()) >= this.todaysDate;

            return timeFilter;
          });
        }

        return filteredArray;
      }),
      tap(trips => {
        if (trips.length > 0) {
          // STORE LATEST UPDATE DATE
          const applicableFroms = [...new Set(trips.map(trip => trip.applicable_from))];
          const latestUpdate = max(applicableFroms.map(applicableFrom => parseISO(applicableFrom)));
          this.latestUpdate = format(latestUpdate, 'do MMMM yyyy') || '';
        }
      }),
      map(trips => {
        const result = trips.reduce((r, a) => {
          r[a.trip_from] = r[a.trip_from] || {};  // {acadimea: , apu: ...}
          r[a.trip_from][a.trip_to] = r[a.trip_from][a.trip_to] || [];

          r[a.trip_from][a.trip_to].push(a);
          return r;
        }, {});

        return result;
      }),
      tap(_ => {
        this.settings.set('tripFrom', this.filterObject.fromLocation);
        this.settings.set('tripTo', this.filterObject.toLocation);
      }),
      finalize(() => refresher && refresher.target.complete()),
    );
  }

  getTrips(refresher: boolean): Observable<BusTrip[]> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    return this.ws.get<BusTrips>(`/transix/trips/applicable`, { auth: false, caching }).pipe(
      map(res => res.trips),
      map(r => {
        return r.map(item => {
          if (!item.trip_time.includes(' ')) {
            // const newDate = new Date();

            // const localToUtcOffset = (newDate.getTimezoneOffset());
            // const localParsedDate = Date.parse(newDate.toString());

            // const utcDate = new Date(localParsedDate + (localToUtcOffset * 60000));
            // const utcParsedDate = Date.parse(utcDate.toUTCString());

            // const d = new Date(utcParsedDate + (480 * 60000));

            // console.log('malaysianTimeIsoString: ', malaysianTimeIsoString);
            const dateObject = new Date(item.trip_time);
            item.trip_time = this.dateWithTimezonePipe.transform(dateObject, 'bus');
          }

          if ((item.trip_time.includes('PM') || item.trip_time.includes('AM')) && (item.trip_time.split(':')[0].length === 1)) {
            item.trip_time = '0' + item.trip_time;
          }
          return item;
        });
      }),
    );
  }

  getLocations(refresher: boolean): Observable<APULocation[]> {
    const caching = refresher ? 'network-or-cache' : 'cache-only';

    return this.ws.get<APULocations>(`/transix/locations`, { auth: false, caching }).pipe(
      map((res: APULocations) => res.locations),
      tap(locations => this.locations = locations)
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

  // GET LOCATION NAME BY LOCATION ID
  getLocationDisplayNameAndType(locationName: any) {
    for (const location of this.locations) {
      if (location.location_name === locationName) {
        return location.location_nice_name + '&&' + location.location_type;
      }
    }
  }

  // GET LOCATION COLOR BY LOCATION ID
  getLocationColor(locationName: any) {
    for (const location of this.locations) {
      if (location.location_name === locationName) {
        return location.location_color;
      }
    }
  }
}
