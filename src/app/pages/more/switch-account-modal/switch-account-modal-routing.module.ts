import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SwitchAccountModalPage } from './switch-account-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SwitchAccountModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwitchAccountModalPageRoutingModule {}
