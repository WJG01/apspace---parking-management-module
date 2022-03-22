import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApcardPage } from './apcard.page';

const routes: Routes = [
  {
    path: '',
    component: ApcardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApcardPageRoutingModule { }
