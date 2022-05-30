import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeWebspacePasswordPage } from './change-webspace-password.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeWebspacePasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeWebspacePasswordPageRoutingModule { }
