import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingMapPage } from './parking-map.page';
import { DateWithTimezonePipe } from 'src/app/shared/date-with-timezone/date-with-timezone.pipe';
import { ConsultationsPage } from '../iconsult/staffs/consultations/consultations.page';
import { FilterSlotsPipe } from '../iconsult/staffs/consultations/filter-slots/filter-slots.pipe';
import { ValidateCheckboxPipe } from '../iconsult/staffs/consultations/validate-checkbox/validate-checkbox.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CalendarModule } from 'ion2-calendar';
import { ComponentsModule } from 'src/app/components/components.module';
import { SharedPipesModule } from 'src/app/shared/shared-pipes.module';
import { SlotDetailsModalPageModule } from '../iconsult/slot-details-modal/slot-details-modal.module';
import { ConsultationsPageRoutingModule } from '../iconsult/staffs/consultations/consultations-routing.module';
import { ReviewDeletionModalPageModule } from '../iconsult/staffs/review-deletion-modal/review-deletion-modal.module';

const routes: Routes = [
  {
    path: '',
    component: ParkingMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultationsPageRoutingModule,
    CalendarModule,
    SharedPipesModule,
    ComponentsModule,
    SlotDetailsModalPageModule,
    ReviewDeletionModalPageModule
  ],
  providers: [DateWithTimezonePipe],
  declarations: [
    ConsultationsPage,
    FilterSlotsPipe,
    ValidateCheckboxPipe
  ],
  exports: [RouterModule],
})
export class ParkingMapPageRoutingModule { }
