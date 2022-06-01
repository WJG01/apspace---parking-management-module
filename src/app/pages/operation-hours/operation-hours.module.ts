import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OperationHoursPageRoutingModule } from './operation-hours-routing.module';
import { OperationHoursPage } from './operation-hours.page';
import { TimePipe } from './time/time.pipe';
import { FilterByCompanyPipe } from './filter-by-company/filter-by-company.pipe';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OperationHoursPageRoutingModule,
    ComponentsModule
  ],
  declarations: [OperationHoursPage, TimePipe, FilterByCompanyPipe]
})
export class OperationHoursPageModule { }
