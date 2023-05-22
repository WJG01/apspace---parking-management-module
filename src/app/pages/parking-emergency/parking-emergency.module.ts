import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParkingEmergencyPageRoutingModule } from './parking-emergency-routing.module';

import { ParkingEmergencyPage } from './parking-emergency.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParkingEmergencyPageRoutingModule
  ],
  declarations: [ParkingEmergencyPage]
})
export class ParkingEmergencyPageModule {}
