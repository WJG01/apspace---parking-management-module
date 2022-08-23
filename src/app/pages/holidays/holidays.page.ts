import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { finalize, map, Observable, tap } from 'rxjs';

import { format } from 'date-fns';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';
import { Storage } from '@ionic/storage-angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { HolidaySets, HolidayV2, Role } from '../../interfaces';
import { ComponentService, WsApiService } from '../../services';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  // Generate PDF Variables
  pdfObj = null; // Used to generate report
  tableBody: any;
  summaryBody: any;
  pdfTitle = '';
  days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  constructor(
    private ws: WsApiService,
    private storage: Storage,
    private plt: Platform,
    private fileOpener: FileOpener,
    private loadingCtrl: LoadingController,
    private component: ComponentService
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

          if (this.filterObject.year === year) {
            for (const holiday of holidaySet.holidays) {
              this.holidays.push(holiday);
            }
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

          if (this.filterObject.upcoming) {
            holidaySet.holidays = holidaySet.holidays.filter(h => new Date(h.holiday_start_date) > this.todaysDate);
          }

          return filteredHolidaySets;
        }

        return filteredHolidaySets;
      }),
      tap(holidaySets => {
        if (holidaySets.length < 1) return;

        for (const holiday of holidaySets[0].holidays) {
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

  async generatePdf() {
    const loading = await this.loadingCtrl.create({
      message: 'Generating PDF...',
    });
    await loading.present();

    this.pdfTitle = `APU Holiday Schedule ${this.filterObject.year}`;
    this.tableBody = [];

    for (const holiday of this.holidays) {
      const dateString = format(new Date(holiday.holiday_start_date), 'yyyy-MM-dd');

      const sDate = new Date(holiday.holiday_start_date);
      const eDate = new Date(holiday.holiday_end_date);

      const sDay = this.days[sDate.getDay()];
      const eDay = this.days[eDate.getDay()];

      const niceSDate = format(new Date(holiday.holiday_start_date), 'dd MMM');
      const niceEDate = format(new Date(holiday.holiday_end_date), 'dd MMM');

      if (dateString === format(new Date(holiday.holiday_start_date), 'yyyy-MM-dd')) {
        const holidayAffecting = holiday.holiday_people_affected === 'all' ? 'Students & Staff'
          : new TitleCasePipe().transform(holiday.holiday_people_affected);
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
                text: holidayAffecting,
                fontSize: 10
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
    }

    const docDefinition = {
      info: {
        title: this.pdfTitle,
        author: 'APSpace_Reports',
        subject: `Holidays @${this.todaysDate.toString()} `,
        keywords: 'Holidays APSpace Reports',
        creator: 'APSpace_Reports',
        producer: 'APSpace_Reports'
      },
      content: [
        {
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABLCAMAAAD9JUoRAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk4REM3MzQ1NzFDMDExRUI4QUM1RTc0QkEyRTBEMDMwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk4REM3MzQ2NzFDMDExRUI4QUM1RTc0QkEyRTBEMDMwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OThEQzczNDM3MUMwMTFFQjhBQzVFNzRCQTJFMEQwMzAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OThEQzczNDQ3MUMwMTFFQjhBQzVFNzRCQTJFMEQwMzAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4QK7LpAAAAYFBMVEX71BM5ndRW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',
          alignment: 'center',
          width: 200
        },
        {
          text: `${this.filterObject.year} Holiday Schedule`,
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
    // Download PDF
    if (this.plt.is('capacitor')) {
      this.pdfObj.getBase64(async (data) => {
        try {
          let path = `apspace/pdf/${this.pdfTitle}`;
          // Save the PDF to the data Directory of our App
          const result = await Filesystem.writeFile({
            path,
            data,
            directory: Directory.Documents,
            recursive: true
          });
          // Dismiss loading & open the PDf with the correct OS tools
          loading.dismiss();
          this.fileOpener.open(`${result.uri}`, 'application/pdf');
        } catch (err) {
          loading.dismiss();
          this.component.toastMessage('Error Generating PDF. Please try again later.', 'danger');
          console.error('Unable to Create File');
        }
      });
    } else {
      loading.dismiss();
      this.pdfObj.download(this.pdfTitle + '.pdf');
    }
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
