import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnonymousFeedbackPage } from './anonymous-feedback.page';

const routes: Routes = [
  {
    path: '',
    component: AnonymousFeedbackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnonymousFeedbackPageRoutingModule { }
