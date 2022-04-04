import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffDirectoryInfoPage } from './staff-directory-info.page';

const routes: Routes = [
  {
    path: '',
    component: StaffDirectoryInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffDirectoryInfoPageRoutingModule { }
