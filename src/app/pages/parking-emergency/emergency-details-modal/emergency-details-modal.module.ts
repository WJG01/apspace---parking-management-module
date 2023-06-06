import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmergencyDetailsModalPageRoutingModule } from './emergency-details-modal-routing.module';

import { EmergencyDetailsModalPage } from './emergency-details-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmergencyDetailsModalPageRoutingModule
  ],
  declarations: [EmergencyDetailsModalPage]
})
export class EmergencyDetailsModalPageModule {}
