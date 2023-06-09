import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmergencyDetailsModalPageRoutingModule } from './emergency-details-modal-routing.module';

import { EmergencyDetailsModalPage } from './emergency-details-modal.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmergencyDetailsModalPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EmergencyDetailsModalPage]
})
export class EmergencyDetailsModalPageModule { }
