import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingMapPage } from './parking-map.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingMapPageRoutingModule {}
