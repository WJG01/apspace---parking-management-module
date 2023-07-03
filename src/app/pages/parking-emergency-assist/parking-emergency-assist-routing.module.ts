import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingEmergencyAssistPage } from './parking-emergency-assist.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingEmergencyAssistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingEmergencyAssistPageRoutingModule {}
