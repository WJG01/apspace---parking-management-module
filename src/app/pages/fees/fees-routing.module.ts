import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeesPage } from './fees.page';

const routes: Routes = [
  {
    path: '',
    component: FeesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeesPageRoutingModule { }
