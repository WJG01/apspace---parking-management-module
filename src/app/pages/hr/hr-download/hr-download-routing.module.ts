import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HrDownloadPage } from './hr-download.page';

const routes: Routes = [
  {
    path: '',
    component: HrDownloadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HrDownloadPageRoutingModule {}
