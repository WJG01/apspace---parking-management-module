import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { finalize, map, Observable, tap } from 'rxjs';

import { parseISO } from 'date-fns';
import { DayConfig, CalendarComponentOptions } from 'ion2-calendar';

import { WsApiService } from '../../../services';
import { Attendance, AttendanceDetails } from '../../../interfaces';

@Component({
  selector: 'app-attendance-details-modal',
  templateUrl: './attendance-details-modal.page.html',
  styleUrls: ['./attendance-details-modal.page.scss'],
})
export class AttendanceDetailsModalPage implements OnInit {

  @Input() intake: string;
  @Input() module: Attendance;
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
    private ws: WsApiService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.showOnCalendar();
  }

  getRecords(): Observable<AttendanceDetails[]> {
    return this.ws.get<AttendanceDetails[]>(`/student/attendance_details?intake_code=${this.intake}&module_code=${this.module.SUBJECT_CODE}`);
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

  // Show more details on click
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
