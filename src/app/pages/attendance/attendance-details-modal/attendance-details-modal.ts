import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { parseISO } from 'date-fns';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';
import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';


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
  details$: Observable<AttendanceDetails[]>;
  details: AttendanceDetails[] = [];
  recordsArray: AttendanceDetails[] = [];
  detailsList: AttendanceDetails[] = [];
  datesConfig: DayConfig[] = [];
  openDate: string;
  showDetails = false;


  options: CalendarComponentOptions = {
    daysConfig: this.datesConfig,
    weekStart: 1
  };

  constructor(
    private modalCtrl: ModalController,
    private navPrms: NavParams,
    private ws: WsApiService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.title = this.navPrms.data.title;

    this.showOnCalendar();
  }

  getRecords(): Observable<AttendanceDetails[]> {
    const intake = this.navPrms.data.intake;
    const module = this.navPrms.data.module;

    return this.ws.get<AttendanceDetails[]>(`/student/attendance_details?intake_code=${intake}&module_code=${module}`);
  }

  showOnCalendar() {
    this.details$ = this.getRecords().pipe(
      map(records => {
        records.map(record => {
          const css = 'attendance';
          const date = this.formatDate(record.CLASS_DATE);

          this.datesConfig.push({
            date,
            marked: true,
            disable: false,
            subTitle: '',
            cssClass: css
          });

          record.CLASS_DATE = date.toDateString();
        });
        return records;
      }),
      tap(res => {
        this.details = res;
      }),
      finalize(() => {
        this.openDate = this.datePipe.transform(this.details[0].CLASS_DATE, 'yyyy-MM-dd');
        this.options.from = new Date(this.details[this.details.length - 1].CLASS_DATE);
        this.options.to = null;
      })
    );
  }

  // show additional info about class on click
  calendarOnChange($event) {
    this.detailsList = []; // Ensure array is empty before pushing new details

    this.details.map((record) => {
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
    return new Date(new Date(parseISO(date)).getTime() + (new Date().getTimezoneOffset() * 60 * 1000));
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
