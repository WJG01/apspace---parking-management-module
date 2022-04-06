import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentSurveyPage } from './student-survey.page';

const routes: Routes = [
  {
    path: '',
    component: StudentSurveyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentSurveyPageRoutingModule { }
