import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckinOTPModalPageRoutingModule } from './checkin-otpmodal-routing.module';

import { CheckinOTPModalPage } from './checkin-otpmodal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckinOTPModalPageRoutingModule
  ],
  declarations: [CheckinOTPModalPage]
})
export class CheckinOTPModalPageModule {}
