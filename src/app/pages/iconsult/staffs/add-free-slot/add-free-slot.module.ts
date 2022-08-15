import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddFreeSlotPageRoutingModule } from './add-free-slot-routing.module';

import { AddFreeSlotPage } from './add-free-slot.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddFreeSlotPageRoutingModule
  ],
  declarations: [AddFreeSlotPage]
})
export class AddFreeSlotPageModule {}
