import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParkingCheckinPageRoutingModule } from './parking-checkin-routing.module';

import { ParkingCheckinPage } from './parking-checkin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParkingCheckinPageRoutingModule
  ],
  declarations: [ParkingCheckinPage]
})
export class ParkingCheckinPageModule {}
