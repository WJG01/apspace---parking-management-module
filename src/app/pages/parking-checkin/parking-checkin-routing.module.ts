import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingCheckinPage } from './parking-checkin.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingCheckinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingCheckinPageRoutingModule {}
