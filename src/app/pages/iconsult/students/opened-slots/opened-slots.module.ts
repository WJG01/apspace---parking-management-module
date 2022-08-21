import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenedSlotsPageRoutingModule } from './opened-slots-routing.module';

import { OpenedSlotsPage } from './opened-slots.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpenedSlotsPageRoutingModule
  ],
  declarations: [OpenedSlotsPage]
})
export class OpenedSlotsPageModule { }
