import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingIncidentPage } from './parking-incident.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingIncidentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingIncidentPageRoutingModule {}
