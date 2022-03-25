import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { DatePickerComponent } from './date-picker/date-picker.component';

@NgModule({
  declarations: [
    DatePickerComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    DatePickerComponent
  ]
})
export class ComponentsModule { }
