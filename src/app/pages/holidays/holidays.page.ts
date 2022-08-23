import { Component, OnInit } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';

import { format } from 'date-fns';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';
import { Storage } from '@ionic/storage-angular';

import { HolidaySets, HolidayV2, Role } from '../../interfaces';
import { WsApiService } from '../../services';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.page.html',
  styleUrls: ['./holidays.page.scss'],
})
export class HolidaysPage implements OnInit {

  devUrl = 'https://2o7wc015dc.execute-api.ap-southeast-1.amazonaws.com/dev';
  holidaySets$: Observable<HolidaySets[]>;
  holidays: HolidayV2[] = [];
  skeleton = new Array(3);
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
  // ion-calendar variables
  datesConfig: DayConfig[] = [];
  options: CalendarComponentOptions = {
    daysConfig: this.datesConfig,
    to: null,
    weekStart: 1,
  };
  selectedHoliday: HolidayV2;

  constructor(
    private ws: WsApiService,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.storage.get('role')
      .then((role: Role) => this.filterObject.affecting = role === Role.Student ? 'students' : 'staffs');

    this.doRefresh();
  }

  doRefresh(refresher?) {
    this.holidays = []; // Empty array before pushing

    this.holidaySets$ = this.ws.get<HolidaySets[]>('/v2/transix/holiday/active', { url: this.devUrl }).pipe(
      tap(holidaySets => {
        for (const holidaySet of holidaySets) {
          const year = holidaySet.year;

          if (this.setYears.indexOf(year) <= -1) {
            this.setYears.push(year);
          }
        }
      }),
      map(holidaySets => {
        let filteredHolidaySets = holidaySets.filter(h => h.year === this.filterObject.year);

        for (const holidaySet of filteredHolidaySets) {
          holidaySet.holidays = holidaySet.holidays.filter(h => h.holiday_people_affected === this.filterObject.affecting);

          if (this.filterObject.duration !== 'all') {
            if (this.filterObject.duration === '1 day') {
              holidaySet.holidays = holidaySet.holidays.filter(h => {
                return this.getNumberOfDaysForHoliday(
                  new Date(format(new Date(h.holiday_start_date), 'yyyy-MM-dd')),
                  new Date(format(new Date(h.holiday_end_date), 'yyyy-MM-dd'))) === '1 day'
              });
            } else {
              holidaySet.holidays = holidaySet.holidays.filter(h => {
                return this.getNumberOfDaysForHoliday(
                  new Date(format(new Date(h.holiday_start_date), 'yyyy-MM-dd')),
                  new Date(format(new Date(h.holiday_end_date), 'yyyy-MM-dd'))) !== '1 day'
              });
            }
          }
          return filteredHolidaySets;
        }

        return filteredHolidaySets;
      }),
      tap(holidaySets => {
        if (holidaySets.length < 1) return;

        for (const holiday of holidaySets[0].holidays) {
          this.holidays.push(holiday);
          this.datesConfig.push({
            date: holiday.holiday_start_date,
            disable: false,
            subTitle: '',
            cssClass: 'holidays',
          });
        }
      }),
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    )
  }

  calendarChanged(ev) {
    for (const holiday of this.holidays) {
      const formattedHoliday = format(new Date(holiday.holiday_start_date), 'yyyy-MM-dd');

      if (ev === formattedHoliday) {
        this.selectedHoliday = holiday;
      }
    }
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
