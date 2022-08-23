import { Component, OnInit } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';

import { format } from 'date-fns';

import { HolidaysV2 } from '../../interfaces';
import { WsApiService } from '../../services';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.page.html',
  styleUrls: ['./holidays.page.scss'],
})
export class HolidaysPage implements OnInit {

  devUrl = 'https://2o7wc015dc.execute-api.ap-southeast-1.amazonaws.com/dev';
  holidays$: Observable<HolidaysV2[]>;
  skeleton = new Array(6);
  selectedSegment: 'list' | 'calendar' = 'list';
  affecting = ['all', 'students', 'staffs'];
  setYears: number[] = [];
  holidayDurations = ['all', '1 day', 'many'];
  todaysDate = new Date();
  filterObject = {
    year: this.todaysDate.getFullYear(),
    affecting: 'all',
    duration: 'all',
    upcoming: true
  }

  constructor(
    private ws: WsApiService
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    this.holidays$ = this.ws.get<HolidaysV2[]>('/v2/transix/holiday/active', { url: this.devUrl }).pipe(
      tap(holidaySets => {
        for (const holidaySet of holidaySets) {
          const year = holidaySet.year;

          if (this.setYears.indexOf(year) <= -1) {
            this.setYears.push(year);
          }
        }
      }),
      map(holidays => {
        let filteredHolidays = holidays.filter(h => h.year === this.filterObject.year);

        for (const filteredHoliday of filteredHolidays) {
          filteredHoliday.holidays = filteredHoliday.holidays.filter(h => h.holiday_people_affected === this.filterObject.affecting);

          if (this.filterObject.duration !== 'all') {
            if (this.filterObject.duration === '1 day') {
              filteredHoliday.holidays = filteredHoliday.holidays.filter(h => {
                return this.getNumberOfDaysForHoliday(
                  new Date(format(new Date(h.holiday_start_date), 'yyyy-MM-dd')),
                  new Date(format(new Date(h.holiday_end_date), 'yyyy-MM-dd'))) === '1 day'
              });
            } else {
              filteredHoliday.holidays = filteredHoliday.holidays.filter(h => {
                return this.getNumberOfDaysForHoliday(
                  new Date(format(new Date(h.holiday_start_date), 'yyyy-MM-dd')),
                  new Date(format(new Date(h.holiday_end_date), 'yyyy-MM-dd'))) !== '1 day'
              });
            }
          }
          return filteredHolidays;
        }

        return filteredHolidays;
      }),
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    )
  }

  generatePdf() {
    // TODO: Implement Logic
  }

  resetFilters() {
    // Only trigger if filter is not the same as default to prevent spamming
    if (this.filterObject.affecting !== 'all' || this.filterObject.duration !== 'all' || !this.filterObject.upcoming || this.filterObject.year !== this.todaysDate.getFullYear()) {
      this.filterObject = {
        year: this.todaysDate.getFullYear(),
        affecting: 'all',
        duration: 'all',
        upcoming: true
      };
      this.doRefresh();
    }
  }

  getNumberOfDaysForHoliday(startDate: Date, endDate: Date): string {
    const secondsDiff = this.getSecondsDifferenceBetweenTwoDates(startDate, endDate);
    const daysDiff = Math.floor(secondsDiff / (3600 * 24));

    return (daysDiff + 1) + ' day' + (daysDiff === 0 ? '' : 's');
  }

  getSecondsDifferenceBetweenTwoDates(startDate: Date, endDate: Date): number {
    return (endDate.getTime() - startDate.getTime()) / 1000;
  }
}
