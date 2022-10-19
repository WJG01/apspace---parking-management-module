import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HrPageRoutingModule } from './hr-routing.module';

import { HrPage } from './hr.page';
import { SortByDatePipe } from './sort-by-date.pipe';

import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HrPageRoutingModule,
    ComponentsModule
  ],
  declarations: [HrPage, SortByDatePipe]
})
export class HrPageModule {}
