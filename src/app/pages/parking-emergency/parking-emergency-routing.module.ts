import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingEmergencyPage } from './parking-emergency.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingEmergencyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingEmergencyPageRoutingModule {}
