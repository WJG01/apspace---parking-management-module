import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarModule } from 'ion2-calendar';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { HolidaysPageRoutingModule } from './holidays-routing.module';
import { HolidaysPage } from './holidays.page';
import { MonthColorPipe } from './month-color/month-color.pipe';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HolidaysPageRoutingModule,
    CalendarModule,
    ComponentsModule
  ],
  declarations: [HolidaysPage, MonthColorPipe],
  providers: [FileOpener]
})
export class HolidaysPageModule { }
