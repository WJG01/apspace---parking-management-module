import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ViewAttendancePageRoutingModule } from './view-attendance-routing.module';
import { ViewAttendancePage } from './view-attendance.page';
import { SearchPipe } from './search/search.pipe';
import { AttendancePipe } from './attendance/attendance.pipe';
import { SharedPipesModule } from '../../../shared/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewAttendancePageRoutingModule,
    SharedPipesModule
  ],
  declarations: [ViewAttendancePage, SearchPipe, AttendancePipe]
})
export class ViewAttendancePageModule { }
