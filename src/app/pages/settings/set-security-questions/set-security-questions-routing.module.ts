import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetSecurityQuestionsPage } from './set-security-questions.page';

const routes: Routes = [
  {
    path: '',
    component: SetSecurityQuestionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetSecurityQuestionsPageRoutingModule { }
