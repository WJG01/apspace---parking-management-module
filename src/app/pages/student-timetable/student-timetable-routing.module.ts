import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentTimetablePage } from './student-timetable.page';

const routes: Routes = [
  {
    path: '',
    component: StudentTimetablePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentTimetablePageRoutingModule {}
