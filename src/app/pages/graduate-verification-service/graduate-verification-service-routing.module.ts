import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GraduateVerificationServicePage } from './graduate-verification-service.page';

const routes: Routes = [
  {
    path: '',
    component: GraduateVerificationServicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GraduateVerificationServicePageRoutingModule {}
