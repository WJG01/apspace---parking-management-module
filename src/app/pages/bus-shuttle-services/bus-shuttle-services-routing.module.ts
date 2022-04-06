import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusShuttleServicesPage } from './bus-shuttle-services.page';

const routes: Routes = [
  {
    path: '',
    component: BusShuttleServicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusShuttleServicesPageRoutingModule { }
