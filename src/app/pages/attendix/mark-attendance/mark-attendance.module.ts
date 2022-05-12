import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { QRCodeModule } from 'angularx-qrcode';

import { MarkAttendancePageRoutingModule } from './mark-attendance-routing.module';
import { MarkAttendancePage } from './mark-attendance.page';
import { SharedPipesModule } from '../../../shared/shared-pipes.module';
import { AttendancePipe } from '../attendance/attendance.pipe';
import { SearchPipe } from '../search/search.pipe';
import { AttendanceStatusPipe } from '../../../shared/attendance-status/attendance-status.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarkAttendancePageRoutingModule,
    QRCodeModule,
    SharedPipesModule
  ],
  declarations: [MarkAttendancePage, AttendancePipe, SearchPipe],
  exports: [AttendancePipe, SearchPipe],
  providers: [DatePipe, AttendanceStatusPipe]
})
export class MarkAttendancePageModule { }
