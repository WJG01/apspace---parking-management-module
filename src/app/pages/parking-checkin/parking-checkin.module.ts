import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParkingCheckinPageRoutingModule } from './parking-checkin-routing.module';

import { ParkingCheckinPage } from './parking-checkin.page';
import { UpdateAttendanceGQL } from 'src/generated/graphql';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParkingCheckinPageRoutingModule
  ],
  providers: [
    UpdateAttendanceGQL,
    // ...
  ],
  declarations: [ParkingCheckinPage]
})
export class ParkingCheckinPageModule { }
