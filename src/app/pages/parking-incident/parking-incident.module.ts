import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParkingIncidentPageRoutingModule } from './parking-incident-routing.module';

import { ParkingIncidentPage } from './parking-incident.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParkingIncidentPageRoutingModule
  ],
  declarations: [ParkingIncidentPage]
})
export class ParkingIncidentPageModule {}
