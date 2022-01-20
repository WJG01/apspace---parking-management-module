import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResitPage } from './resit.page';

const routes: Routes = [
  {
    path: '',
    component: ResitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResitPageRoutingModule { }
