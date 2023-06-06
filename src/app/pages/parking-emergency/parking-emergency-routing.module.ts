import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingEmergencyPage } from './parking-emergency.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingEmergencyPage
  },
  {
    path: 'emergency-details-modal',
    loadChildren: () => import('./emergency-details-modal/emergency-details-modal.module').then( m => m.EmergencyDetailsModalPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParkingEmergencyPageRoutingModule {}
