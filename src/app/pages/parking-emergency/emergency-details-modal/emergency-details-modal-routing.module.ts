import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmergencyDetailsModalPage } from './emergency-details-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EmergencyDetailsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmergencyDetailsModalPageRoutingModule {}
