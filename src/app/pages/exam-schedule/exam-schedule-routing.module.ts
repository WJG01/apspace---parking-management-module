import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExamSchedulePage } from './exam-schedule.page';

const routes: Routes = [
  {
    path: '',
    component: ExamSchedulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamSchedulePageRoutingModule { }
