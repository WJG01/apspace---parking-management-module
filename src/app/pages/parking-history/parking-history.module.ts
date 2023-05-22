import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParkingHistoryPageRoutingModule } from './parking-history-routing.module';

import { ParkingHistoryPage } from './parking-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParkingHistoryPageRoutingModule
  ],
  declarations: [ParkingHistoryPage]
})
export class ParkingHistoryPageModule {}
