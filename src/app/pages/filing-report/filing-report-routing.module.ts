import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilingReportPage } from './filing-report.page';

const routes: Routes = [
  {
    path: '',
    component: FilingReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilingReportPageRoutingModule {}
