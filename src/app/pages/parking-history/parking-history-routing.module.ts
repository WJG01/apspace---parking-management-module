import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingHistoryPage } from './parking-history.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingHistoryPageRoutingModule {}
