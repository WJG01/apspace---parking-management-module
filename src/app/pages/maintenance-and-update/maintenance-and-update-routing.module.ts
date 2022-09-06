import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaintenanceAndUpdatePage } from './maintenance-and-update.page';

const routes: Routes = [
  {
    path: '',
    component: MaintenanceAndUpdatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaintenanceAndUpdatePageRoutingModule { }
