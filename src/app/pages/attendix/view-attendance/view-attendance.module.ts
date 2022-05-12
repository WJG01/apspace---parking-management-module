import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ViewAttendancePageRoutingModule } from './view-attendance-routing.module';
import { ViewAttendancePage } from './view-attendance.page';
import { SharedPipesModule } from '../../../shared/shared-pipes.module';
import { AttendanceStatusPipe } from '../../../shared/attendance-status/attendance-status.pipe';
import { MarkAttendancePageModule } from '../mark-attendance/mark-attendance.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewAttendancePageRoutingModule,
    SharedPipesModule,
    MarkAttendancePageModule
  ],
  declarations: [ViewAttendancePage],
  providers: [AttendanceStatusPipe]
})
export class ViewAttendancePageModule { }
