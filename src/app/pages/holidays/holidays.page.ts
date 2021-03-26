import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { LoadingController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { differenceInDays, eachDayOfInterval, format } from 'date-fns';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { Holiday, Holidays, Role } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';


pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.page.html',
  styleUrls: ['./holidays.page.scss'],
})
export class HolidaysPage implements OnInit {
  loading: HTMLIonLoadingElement;
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
  filterMenuHidden = true;
  tableBody: any = [];

  pdfObj = null;
  pdfTitle = '';

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

  days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  selectedSegment = 'ListView';
  skeletons = new Array(6);

  constructor(
    private ws: WsApiService,
    private datePipe: DatePipe,
    private storage: Storage,
    private plt: Platform,
    private file: File,
    private fileOpener: FileOpener,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.defaultFilter();
    this.createLoading();
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
        // Reset calendar before uploading new filtered data
        this.dateArray = [{
          holiday_name: '',
          holiday_start_date: null,
          holiday_end_date: null,
          holiday_people_affected: ''
        }];

        this.datesConfig = [];
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
    this.defaultFilter();
    this.onFilter();
  }

  showFilterMenu() {
    if (this.filterMenuHidden === true) {
      this.filterMenuHidden = false;
    } else {
      this.filterMenuHidden = true;
    }
  }

  async createLoading(){
    this.loading = await this.loadingCtrl.create({
      spinner: 'dots',
      duration: 5000,
      message: 'Please wait...',
      translucent: true
    });
  }

  async presentLoading(){
    await this.loading.present();
  }

  async dismissLoading(){
    await this.loading.dismiss();
  }

  generateHolidaysPDF() {
    this.presentLoading();
    this.pdfTitle = `APU Holiday Schedule ${this.todaysDate.getFullYear()}`;
    this.tableBody = [];


    this.holiday$
    .pipe(
      tap(holidays => {
        holidays.forEach(holiday => {
          const dateString = this.datePipe.transform(new Date(holiday.holiday_start_date), 'yyyy-MM-dd');

          const sDate = new Date(holiday.holiday_start_date);
          const eDate = new Date(holiday.holiday_end_date);


          const sDay = this.days[sDate.getDay()];
          const eDay = this.days[eDate.getDay()];

          const niceSDate = this.datePipe.transform(new Date(holiday.holiday_start_date), 'dd MMM');
          const niceEDate = this.datePipe.transform(new Date(holiday.holiday_end_date), 'dd MMM');


          if (dateString === this.datePipe.transform(holiday.holiday_start_date, 'yyyy-MM-dd')) {
            const holidayData = [
              {
                border: [true, true, false, true],
                fontSize: 13,
                text: [
                  {
                    text: niceSDate !== niceEDate ? `${niceSDate} - ${niceEDate}\n` : niceSDate === niceEDate ? `${niceSDate}\n` : `${niceSDate}\n`, bold: true
                  },
                  { text: niceSDate !== niceEDate ? `${sDay} - ${eDay}` : niceSDate === niceEDate ? sDay : sDay, fontSize: 10 }
                ],
                margin: [0, 10, 0, 10],
                alignment: 'center',
              },
              {
                border: [false, true, false, true],
                text: [
                  { text: `${holiday.holiday_name}\n`, bold: true },
                  {
                    text: holiday.holiday_people_affected === 'students,staff' ? 'Students & Staff' : holiday.holiday_people_affected === 'students'
                      ? 'Students' : 'Staff', fontSize: 10
                  }
                ],
                margin: [0, 10, 0, 10]
              },
              {
                border: [false, true, true, true],
                text: '',
                margin: [0, 10, 0, 10],
              }
            ];
            this.tableBody.push(holidayData);
          }
        });
      }),
      tap(_ => {
        const docDefinition = {
          info: {
            title: this.pdfTitle,
            author: 'APSpace_Reports',
            subject: `Holidays @${this.todaysDate.toString()} `,
            keywords: 'Holidays APSpace Reports',
            creator: 'APSpace_Reports',
            producer: 'APSpace_Reports',
            creationDate: this.todaysDate.toDateString(),
            modDate: this.todaysDate.toDateString()
          },
          content: [
            {
              image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABLCAMAAAD9JUoRAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk4REM3MzQ1NzFDMDExRUI4QUM1RTc0QkEyRTBEMDMwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk4REM3MzQ2NzFDMDExRUI4QUM1RTc0QkEyRTBEMDMwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OThEQzczNDM3MUMwMTFFQjhBQzVFNzRCQTJFMEQwMzAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OThEQzczNDQ3MUMwMTFFQjhBQzVFNzRCQTJFMEQwMzAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4QK7LpAAAAYFBMVEX71BM5ndRW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',
              alignment: 'center',
              width: 200
            },
            {
              text: `${this.todaysDate.getFullYear()} Holiday Schedule`,
              style: 'header',
              alignment: 'center',
              margin: [0, 20, 0, 10]
            },
            {
              style: 'tableExample',
              table: {
                widths: [110, 300, '*'],
                body: this.tableBody,
              },
            },
          ],
          footer: (currentPage, pageCount) => {
            return {
              columns: [
                { width: '5%', text: '', margin: [0, 10, 0, 10] },
                {
                  width: '75%',
                  text: `Generated using APSpace (${this.todaysDate.toDateString()})`,
                  margin: [0, 10, 0, 10],
                  alignment: 'left',
                  fontSize: 10,
                  style: 'greyColor'
                },
                {
                  width: '5%',
                  margin: [0, 10, 0, 10],
                  text: ''
                },
                {
                  width: '10%',
                  text: currentPage.toString() + ' of ' + pageCount,
                  fontSize: 10,
                  margin: [0, 10, 0, 10],
                  alignment: 'right',
                  style: 'greyColor'
                },
                { width: '5%', text: '', margin: [0, 10, 0, 10] }
              ]
            };
          },
          styles: {
            header: {
              fontSize: 20,
              bold: true
            },
            tableExample: {
              margin: [0, 5, 0, 15],
              fillColor: '#fdeded'
            }
          }
        };
        this.pdfObj = pdfMake.createPdf(docDefinition);
        this.downloadPDF();
      })
    )
    .subscribe();
}

  downloadPDF() {
    if (this.plt.is('cordova')) {
      this.pdfObj.getBuffer((buffer) => {
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const directoryType = this.plt.is('android') ? this.file.externalDataDirectory : this.file.dataDirectory;

        this.file.writeFile(directoryType, `${ this.pdfTitle }.pdf`, blob, { replace: true }).then(_ => {
          this.dismissLoading();
          this.fileOpener.open(directoryType + `${ this.pdfTitle }.pdf`, 'application/pdf');
        });

      });
    } else {
      this.dismissLoading();
      this.pdfObj.download(this.pdfTitle + '.pdf');
    }
  }
}
