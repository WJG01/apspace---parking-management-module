import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApcardQrCodePage } from './apcard-qr-code.page';

const routes: Routes = [
  {
    path: '',
    component: ApcardQrCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApcardQrCodePageRoutingModule { }
