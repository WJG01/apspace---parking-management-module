import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AppointmentsPageRoutingModule } from './appointments-routing.module';
import { AppointmentsPage } from './appointments.page';
import { SharedPipesModule } from '../../../../shared/shared-pipes.module';
import { ComponentsModule } from '../../../../components/components.module';
import { SlotDetailsModalPageModule } from '../../slot-details-modal/slot-details-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentsPageRoutingModule,
    SharedPipesModule,
    ComponentsModule,
    SlotDetailsModalPageModule
  ],
  declarations: [AppointmentsPage]
})
export class AppointmentsPageModule { }
