import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookParkingPage } from './parking-book.page';

const routes: Routes = [
  {
    path: '',
    component: BookParkingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookParkingPageRoutingModule {}
