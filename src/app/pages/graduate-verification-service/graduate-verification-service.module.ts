import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { GraduateVerificationServicePageRoutingModule } from './graduate-verification-service-routing.module';
import { GraduateVerificationServicePage } from './graduate-verification-service.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GraduateVerificationServicePageRoutingModule
  ],
  declarations: [GraduateVerificationServicePage]
})
export class GraduateVerificationServicePageModule {}
