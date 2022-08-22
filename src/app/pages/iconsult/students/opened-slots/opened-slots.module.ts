import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarModule } from 'ion2-calendar';

import { OpenedSlotsPageRoutingModule } from './opened-slots-routing.module';
import { OpenedSlotsPage } from './opened-slots.page';
import { DateWithTimezonePipe } from '../../../../shared/date-with-timezone/date-with-timezone.pipe';
import { SharedPipesModule } from '../../../../shared/shared-pipes.module';
import { ComponentsModule } from '../../../../components/components.module';
import { BookSlotModalPageModule } from '../book-slot-modal/book-slot-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpenedSlotsPageRoutingModule,
    CalendarModule,
    SharedPipesModule,
    ComponentsModule,
    BookSlotModalPageModule
  ],
  declarations: [OpenedSlotsPage],
  providers: [DateWithTimezonePipe]
})
export class OpenedSlotsPageModule { }
