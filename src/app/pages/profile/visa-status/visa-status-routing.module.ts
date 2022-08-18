import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisaStatusPage } from './visa-status.page';

const routes: Routes = [
  {
    path: '',
    component: VisaStatusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisaStatusPageRoutingModule {}
