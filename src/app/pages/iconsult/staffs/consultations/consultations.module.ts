import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CalendarModule } from 'ion2-calendar';

import { ConsultationsPageRoutingModule } from './consultations-routing.module';
import { ConsultationsPage } from './consultations.page';
import { DateWithTimezonePipe } from '../../../../shared/date-with-timezone/date-with-timezone.pipe';
import { FilterSlotsPipe } from './filter-slots/filter-slots.pipe';
import { SharedPipesModule } from '../../../../shared/shared-pipes.module';
import { ValidateCheckboxPipe } from './validate-checkbox/validate-checkbox.pipe';
import { ComponentsModule } from '../../../../components/components.module';
import { SlotDetailsModalPageModule } from '../slot-details-modal/slot-details-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultationsPageRoutingModule,
    CalendarModule,
    SharedPipesModule,
    ComponentsModule,
    SlotDetailsModalPageModule
  ],
  providers: [DateWithTimezonePipe],
  declarations: [
    ConsultationsPage,
    FilterSlotsPipe,
    ValidateCheckboxPipe
  ]
})
export class ConsultationsPageModule { }
