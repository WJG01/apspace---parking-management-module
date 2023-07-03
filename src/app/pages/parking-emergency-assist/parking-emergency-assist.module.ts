import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParkingEmergencyAssistPageRoutingModule } from './parking-emergency-assist-routing.module';

import { ParkingEmergencyAssistPage } from './parking-emergency-assist.page';
import { KeyValuePipe } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParkingEmergencyAssistPageRoutingModule
  ],
  declarations: [ParkingEmergencyAssistPage],
  providers: [KeyValuePipe],
})
export class ParkingEmergencyAssistPageModule { }
