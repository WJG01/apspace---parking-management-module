import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckinOTPModalPage } from './checkin-otpmodal.page';

const routes: Routes = [
  {
    path: '',
    component: CheckinOTPModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckinOTPModalPageRoutingModule {}
