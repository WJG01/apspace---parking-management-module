import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { differenceInDays, eachDayOfInterval, format } from 'date-fns';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';
import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { Holiday, Holidays, Role } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';



@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.page.html',
  styleUrls: ['./holidays.page.scss'],
})
export class HolidaysPage implements OnInit {
  holiday$: Observable<Holiday[]>;
  filteredHoliday$: Observable<Holiday[]>;
  datesConfig: DayConfig[] = [];
  options: CalendarComponentOptions = {
    daysConfig: this.datesConfig,
    weekStart: 1,
  };
  holidayTitle: string;
  holidaysAffected: string;
  showDetails: boolean;
  remainingDays: string;
  todaysDate = new Date();

  filterObject: {
    show: 'all' | 'upcoming',
    numberOfDays: '' | '1 day' | 'many',
    affecting: '' | 'students' | 'staff'
  } = {
      show: 'all',
      numberOfDays: '',
      affecting: ''
    };

  dateArray: [{
    holiday_name: string,
    holiday_start_date: Date,
    holiday_end_date: Date,
    holiday_people_affected: string
  }] = [{
    holiday_name: '',
    holiday_start_date: null,
    holiday_end_date: null,
    holiday_people_affected: ''
  }];

  selectedSegment = 'ListView';
  skeletons = new Array(6);

  constructor(
    private ws: WsApiService,
    private datePipe: DatePipe,
    private storage: Storage,
  ) { }

  ngOnInit() {
    this.defaultFilter();
  }

  ionViewDidEnter() {
    this.doRefresh();
  }

  getHolidays(refresher: boolean) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    return this.holiday$ = this.ws.get<Holidays>(`/transix/holidays`, { auth: false, caching }).pipe(
      map(res => res.holidays.filter(holiday => +holiday.holiday_start_date.split('-')[0] >= this.todaysDate.getFullYear())),
    );
  }

  doRefresh(refresher?) {
    this.filteredHoliday$ = this.getHolidays(refresher).pipe(
      tap(_ => this.onFilter()),
      finalize(() => refresher && refresher.target.complete()),
    );
  }

  holidayItemOnChange($event: any) {
    this.showDetails = false;
    this.dateArray.forEach((res) => {
      const date = this.datePipe.transform(new Date(res.holiday_start_date), 'yyyy-MM-dd');

      if ($event === date) {

        const dayDifference = differenceInDays(
          new Date(res.holiday_start_date),
          this.todaysDate
        );
        if (date === this.datePipe.transform(res.holiday_start_date, 'yyyy-MM-dd')) {
          this.holidayTitle = res.holiday_name;
          this.holidaysAffected = res.holiday_people_affected;
          this.remainingDays = dayDifference < 0 ? Math.abs(dayDifference) + ' Days Ago' : dayDifference === 0
            ? 'Today' : dayDifference === 1
              ? '1 Day Remaining' : dayDifference + ' Days Remaining';
          this.showDetails = true;
        }
      }
    });
  }

  onFilter() {
    this.filteredHoliday$ = this.holiday$.pipe(
      map(holidays => {

        let filteredArray = holidays.filter(holiday => {
          return (
            holiday.holiday_people_affected.includes(this.filterObject.affecting)
          );
        });

        if (this.filterObject.show === 'upcoming') {
          filteredArray = filteredArray.filter(holiday => {
            return new Date(holiday.holiday_start_date) > this.todaysDate;
          });
        }

        if (this.filterObject.numberOfDays !== '') {
          filteredArray = filteredArray.filter(holiday => {
            if (this.filterObject.numberOfDays === '1 day') {
              return this.getNumberOfDaysForHoliday(
                new Date(format(new Date(holiday.holiday_start_date), 'yyyy-MM-dd')),
                new Date(format(new Date(holiday.holiday_end_date), 'yyyy-MM-dd'))) === '1 day';
            } else {
              return this.getNumberOfDaysForHoliday(
                new Date(format(new Date(holiday.holiday_start_date), 'yyyy-MM-dd')),
                new Date(format(new Date(holiday.holiday_end_date), 'yyyy-MM-dd'))) !== '1 day';
            }
          });
        }

        return filteredArray;
      }),
      tap(filteredHolidays => {
        // Did not user global variable of today's date because we are modifying the const
        const today = new Date();

        today.setMonth(0);
        today.setDate(0);

        this.options = {
          from: today,
          to: null,
          daysConfig: this.datesConfig,
        };

        filteredHolidays.forEach(holiday => {

          if (holiday.holiday_start_date === holiday.holiday_end_date) {

            this.dateArray.push({
              holiday_name: holiday.holiday_name,
              holiday_start_date: new Date(holiday.holiday_start_date),
              holiday_end_date: new Date(holiday.holiday_end_date),
              holiday_people_affected: holiday.holiday_people_affected
            });

          } else if (holiday.holiday_start_date !== holiday.holiday_end_date) {
            let tempDateArray: Date[] = [];

            tempDateArray = (eachDayOfInterval({ start: new Date(holiday.holiday_start_date), end: new Date(holiday.holiday_end_date) }));

            tempDateArray.forEach(date => {
              this.dateArray.push({
                holiday_name: holiday.holiday_name,
                holiday_start_date: date,
                holiday_end_date: new Date(holiday.holiday_end_date),
                holiday_people_affected: holiday.holiday_people_affected
              });
            });
          }
        });

        this.dateArray.forEach(holidayDate => (

          this.datesConfig.push({
            date: holidayDate.holiday_start_date,
            marked: true,
            disable: false,
            subTitle: '.',
            cssClass: 'holidays',
          })
        ));
      })
    );
  }

  getNumberOfDaysForHoliday(startDate: Date, endDate: Date): string {
    const secondsDiff = this.getSecondsDifferenceBetweenTwoDates(startDate, endDate);
    const daysDiff = Math.floor(secondsDiff / (3600 * 24));
    return (daysDiff + 1) + ' day' + (daysDiff === 0 ? '' : 's');
  }

  getSecondsDifferenceBetweenTwoDates(startDate: Date, endDate: Date): number {
    // PARAMETERS MUST BE STRING. FORMAT IS ('HH:mm A')
    // RETURN TYPE IS STRING. FORMAT: 'HH hrs mm min'
    return (endDate.getTime() - startDate.getTime()) / 1000;
  }

  defaultFilter() {
    this.storage.get('role').then((role: Role) => {
      this.filterObject.affecting = role === Role.Student ? 'students' : 'staff';
    });
  }

  clearFilter() {
    this.filterObject = {
      show: 'all',
      numberOfDays: '',
      affecting: ''
    };

    this.onFilter();
  }
}
