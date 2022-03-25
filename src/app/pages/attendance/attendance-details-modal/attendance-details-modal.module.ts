import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarModule } from 'ion2-calendar';

import { AttendanceDetailsModalPage } from './attendance-details-modal.page';
import { AttendanceStatusPipe } from '../attendance-status/attendance-status.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarModule
  ],
  declarations: [AttendanceDetailsModalPage, AttendanceStatusPipe],
  providers: [DatePipe]
})
export class AttendanceDetailsModalPageModule { }
