import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { DatePickerComponent } from './date-picker/date-picker.component';
import { MessageWithSvgComponent } from './message-with-svg/message-with-svg.component';

@NgModule({
  declarations: [
    DatePickerComponent,
    MessageWithSvgComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    DatePickerComponent,
    MessageWithSvgComponent
  ]
})
export class ComponentsModule { }
