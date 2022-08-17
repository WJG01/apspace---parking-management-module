import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AplcProgressionPage } from './aplc-progression.page';

const routes: Routes = [
  {
    path: '',
    component: AplcProgressionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AplcProgressionPageRoutingModule { }
