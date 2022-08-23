import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarModule } from 'ion2-calendar';

import { HolidaysPageRoutingModule } from './holidays-routing.module';
import { HolidaysPage } from './holidays.page';
import { MonthColorPipe } from './month-color/month-color.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HolidaysPageRoutingModule,
    CalendarModule
  ],
  declarations: [HolidaysPage, MonthColorPipe]
})
export class HolidaysPageModule { }
