import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperationHoursPage } from './operation-hours.page';

const routes: Routes = [
  {
    path: '',
    component: OperationHoursPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperationHoursPageRoutingModule { }
