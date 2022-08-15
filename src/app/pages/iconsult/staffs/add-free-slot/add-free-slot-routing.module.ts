import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddFreeSlotPage } from './add-free-slot.page';

const routes: Routes = [
  {
    path: '',
    component: AddFreeSlotPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddFreeSlotPageRoutingModule {}
