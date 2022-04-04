import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffDirectoryPage } from './staff-directory.page';

const routes: Routes = [
  {
    path: '',
    component: StaffDirectoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffDirectoryPageRoutingModule { }
