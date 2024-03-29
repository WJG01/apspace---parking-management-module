import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ClassesPageRoutingModule } from './classes-routing.module';
import { ClassesPage } from './classes.page';
import { ComponentsModule } from '../../../components/components.module';
import { ClasscodesFilterPipe } from './classcodes-filter/classcodes-filter.pipe';
import { AttendanceIntegrityModalPageModule } from './attendance-integrity-modal/attendance-integrity-modal.module';
import { ConfirmClassCodeModalPageModule } from './confirm-class-code-modal/confirm-class-code-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassesPageRoutingModule,
    ComponentsModule,
    AttendanceIntegrityModalPageModule,
    ConfirmClassCodeModalPageModule
  ],
  declarations: [ClassesPage, ClasscodesFilterPipe],
  providers: [DatePipe]
})
export class ClassesPageModule { }
