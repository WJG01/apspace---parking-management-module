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
  setDetails: TransixScheduleSet;
  locations$: Observable<TransixLocation[]>;
  locations: TransixLocation[];
  todaysDate = new Date();
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
  timeFormat: string;
  locationLoaded: boolean;
  dayFilterDisabled: boolean; // Only disable when user filtering location to Mosque

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

    if (this.settings.get('timeFormat')) {
      this.timeFormat = this.settings.get('timeFormat');
    }

    this.doRefresh();
  }

  doRefresh(refresher?) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    this.dayFilterDisabled = false;

    if (refresher) { // clear the filter data if user refresh the page
      this.filterObject = {
        fromLocation: '',
        toLocation: '',
        tripDay: this.getTodayDay(this.todaysDate),
      };
    }
    // Day filter will be disabled when location is changed to mosque
    if (this.filterObject.fromLocation.toLowerCase() === 'mosque' || this.filterObject.toLocation.toLowerCase() === 'mosque') {
      this.dayFilterDisabled = true;
      this.filterObject.tripDay = 'friday only';
    } else if (this.filterObject.tripDay === 'friday only') { // Defaults trip day to mon-fri, in case location is changed from mosque
      this.filterObject.tripDay = this.getTodayDay(this.todaysDate);
    }
    // Added this check so Filter card will not be loading when users are filtering trips
    if (!this.locationLoaded) {
      this.locations$ = this.ws.get<TransixLocation[]>('/v2/transix/locations', { url: this.devUrl, caching }).pipe(
        tap(locations => this.locations = locations),
        tap(_ => this.locationLoaded = true),
        finalize(() => refresher && refresher.target.complete())
      );
    }

    this.trips$ = this.ws.get<TransixScheduleSet>('/v2/transix/schedule/active', { url: this.devUrl, caching })
      .pipe(
        // Get Information about the Set
        tap(set => this.setDetails = set),
        map(set => set.trips),
        map(trips => {
          // Map Trip Time into proper Date format. TransiX by default uses 12 hours format
          trips
            .map(trip => trip.time = this.dateWithTimezonePipe.transform(parse(trip.time, 'hh:mm aa', new Date()), 'bus'));
          // Sort based on Time
          return trips
            .sort((a, b) => {
              const timeFormat = this.timeFormat === '12' ? 'hh:mm aa' : 'HH:mm';
              const firstTime = parse(a.time.replace(' (GMT+8)', ''), timeFormat, new Date());
              const secondTime = parse(b.time.replace(' (GMT+8)', ''), timeFormat, new Date());

              return firstTime.getTime() - secondTime.getTime();
            });
        }),
        map(trips => {
          let filteredTrips = trips.filter(trip => trip.day.toLowerCase() === 'mon-fri' || trip.day.toLowerCase() === 'friday only');

          if (this.filterObject.tripDay !== 'mon-fri') {
            filteredTrips = filteredTrips.filter(trip => trip.day === this.filterObject.tripDay);
          }

          if (!this.detailedView) {
            filteredTrips = filteredTrips.filter(trip => {
              const timeFormat = this.timeFormat === '12' ? 'hh:mm aa' : 'HH:mm';

              return parse(trip.time.replace(' (GMT+8)', ''), timeFormat, new Date()) >= this.todaysDate;
            });
          }

          if (this.filterObject.fromLocation !== '') {
            filteredTrips = filteredTrips.filter(trip => trip.trip_from.name.toLowerCase() === this.filterObject.fromLocation.toLowerCase());
          }

          if (this.filterObject.toLocation !== '') {
            filteredTrips = filteredTrips.filter(trip => trip.trip_to.name.toLowerCase() === this.filterObject.toLocation.toLowerCase());
          }

          return filteredTrips;
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
        tap(_ => {
          this.settings.set('tripFrom', this.filterObject.fromLocation);
          this.settings.set('tripTo', this.filterObject.toLocation);
        }),
        finalize(() => refresher && refresher.target.complete())
      );
  }

  maja() {

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

  getLocationColor(location: string) {
    if (this.locations && this.locations.length < 1) return; // Ignore if Location data is not available

    const locationColor = this.locations.reduce((acc, location) => ({ ...acc, [location.name]: location.color }));

    return locationColor[location] || 'var(--ion-color-primary)'; // Fallback if location name does not exists
  }
}
