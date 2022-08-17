import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MentorshipPage } from './mentorship.page';

const routes: Routes = [
  {
    path: '',
    component: MentorshipPage
  },
  {
    path: ':tp/:intake/view',
    loadChildren: () => import('./view-student/view-student.module').then( m => m.ViewStudentPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MentorshipPageRoutingModule {}
