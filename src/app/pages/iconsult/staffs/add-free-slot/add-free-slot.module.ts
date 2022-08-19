import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarModule } from 'ion2-calendar';

import { AddFreeSlotPageRoutingModule } from './add-free-slot-routing.module';
import { AddFreeSlotPage } from './add-free-slot.page';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddFreeSlotPageRoutingModule,
    CalendarModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [AddFreeSlotPage]
})
export class AddFreeSlotPageModule { }
