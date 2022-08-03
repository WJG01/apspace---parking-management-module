import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExamScheduleAdminPage } from './exam-schedule-admin.page';

const routes: Routes = [
  {
    path: '',
    component: ExamScheduleAdminPage
  },
  {
    path: 'add-exam-schedule',
    loadChildren: () => import('./add-exam-schedule/add-exam-schedule.module').then( m => m.AddExamSchedulePageModule)
  },
  {
    path: 'exam-schedule-details',
    loadChildren: () => import('./exam-schedule-details/exam-schedule-details.module').then( m => m.ExamScheduleDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamScheduleAdminPageRoutingModule {}
