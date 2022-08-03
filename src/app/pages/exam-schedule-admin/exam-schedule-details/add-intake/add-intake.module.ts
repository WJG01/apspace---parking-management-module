import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddIntakePageRoutingModule } from './add-intake-routing.module';

import { AddIntakePage } from './add-intake.page';
import { CalendarModule } from 'ion2-calendar';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddIntakePageRoutingModule,
        CalendarModule,
        ReactiveFormsModule
    ],
  declarations: [AddIntakePage]
})
export class AddIntakePageModule {}
