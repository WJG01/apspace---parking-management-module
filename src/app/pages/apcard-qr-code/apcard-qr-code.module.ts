import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ApcardQrCodePageRoutingModule } from './apcard-qr-code-routing.module';
import { ApcardQrCodePage } from './apcard-qr-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApcardQrCodePageRoutingModule
  ],
  declarations: [ApcardQrCodePage]
})
export class ApcardQrCodePageModule { }
