import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MorePage } from './more.page';

const routes: Routes = [
  {
    path: '',
    component: MorePage
  },  {
    path: 'switch-account-modal',
    loadChildren: () => import('./switch-account-modal/switch-account-modal.module').then( m => m.SwitchAccountModalPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MorePageRoutingModule { }
