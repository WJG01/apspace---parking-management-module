import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AttendancePageRoutingModule } from './attendance-routing.module';
import { AttendancePage } from './attendance.page';
import { AttendanceDetailsModalPageModule } from './attendance-details-modal/attendance-details-modal.module';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendancePageRoutingModule,
    AttendanceDetailsModalPageModule,
    ComponentsModule
  ],
  declarations: [AttendancePage]
})
export class AttendancePageModule { }
