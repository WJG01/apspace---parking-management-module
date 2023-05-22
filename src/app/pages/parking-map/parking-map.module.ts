import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParkingMapPageRoutingModule } from './parking-map-routing.module';

import { ParkingMapPage } from './parking-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParkingMapPageRoutingModule
  ],
  declarations: [ParkingMapPage]
})
export class ParkingMapPageModule {}
