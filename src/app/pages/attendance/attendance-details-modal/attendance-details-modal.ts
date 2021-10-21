import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { parseISO } from 'date-fns';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';
import { Observable } from 'rxjs';


import { AttendanceDetails } from 'src/app/interfaces/attendance-details';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-attendance-details-modal',
  templateUrl: './attendance-details-modal.html',
  styleUrls: ['./attendance-details-modal.scss'],
  providers: [DatePipe]
})
export class AttendanceDetailsModalPage implements OnInit {

  title: string;
  intake: string;
  module: string;

  recordsArray: AttendanceDetails[] = [];
  datesConfig: DayConfig[] = [];
  openDate: string;


  detailsList: AttendanceDetails[] = [];
  showDetails = false;

  loaded = false;


  options: CalendarComponentOptions = {
    daysConfig: this.datesConfig,
    weekStart: 1
  };

  constructor(
    private modalCtrl: ModalController,
    private navPrms: NavParams,
    private ws: WsApiService,
    private datePipe: DatePipe
  ) {
    this.title = this.navPrms.data.title;
    this.intake = this.navPrms.data.intake;
    this.module = this.navPrms.data.module;
  }

  ngOnInit() {
    this.showOnCalendar();
  }

  getRecords(): Observable<AttendanceDetails[]> {
    return this.ws.get<AttendanceDetails[]>(`/student/attendance_details?intake_code=${this.intake}&module_code=${this.module}`);
  }

  showOnCalendar() {
    this.getRecords().subscribe(
      {
        next: (records) => {
          records.map((record) => {
            const css = 'attendance';

            const date = this.formatDate(record.CLASS_DATE);

            this.datesConfig.push({
                        date,
                        subTitle: '.',
                        marked: true,
                        cssClass: css,
                        disable: false
                      });

            this.recordsArray.push({
                        ATTENDANCE_STATUS: record.ATTENDANCE_STATUS,
                        CLASS_DATE: date.toDateString(),
                        CLASS_TYPE: record.CLASS_TYPE,
                        TIME_FROM: record.TIME_FROM,
                        TIME_TO: record.TIME_TO
                      });
          });
        },
        complete: () => {
          // picks first date from array(most recent) and opens it in calendar
          this.openDate = this.datePipe.transform(this.recordsArray[0].CLASS_DATE, 'yyyy-MM-dd');
          this.options.from = new Date(this.recordsArray[this.recordsArray.length - 1].CLASS_DATE);
          this.options.to = null;
          this.loaded = true;
        }
      }
    );
  }

  // show additional info about class on click
  onChange($event: string) {
    this.detailsList = [];

    this.recordsArray.map((record) => {
      const date = this.datePipe.transform(record.CLASS_DATE, 'yyyy-MM-dd');

      if ($event === date) {
        this.detailsList.push({
          CLASS_TYPE: record.CLASS_TYPE,
          TIME_FROM: record.TIME_FROM,
          TIME_TO: record.TIME_TO,
          ATTENDANCE_STATUS: record.ATTENDANCE_STATUS,
          CLASS_DATE: record.CLASS_DATE
        });
        this.showDetails = true;
      }
    });
  }

  formatDate(date: string) {
    return new Date(new Date(parseISO(date + 'Z')).getTime() + (new Date().getTimezoneOffset() * 60 * 1000));
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
