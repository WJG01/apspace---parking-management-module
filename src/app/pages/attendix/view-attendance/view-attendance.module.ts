import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ChartModule } from 'angular2-chartjs';

import { AttendancePipe } from './attendance.pipe';
import { SearchPipe } from './search.pipe';
import { ViewAttendancePage } from './view-attendance.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAttendancePage
  }
];


@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ViewAttendancePage, AttendancePipe, SearchPipe]
})
export class ViewAttendanceModule { }
