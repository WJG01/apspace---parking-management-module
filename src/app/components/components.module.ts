import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { DatePickerComponent } from './date-picker/date-picker.component';
import { MessageWithSvgComponent } from './message-with-svg/message-with-svg.component';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DatePickerComponent,
    MessageWithSvgComponent,
    SearchModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  exports: [
    DatePickerComponent,
    MessageWithSvgComponent,
    SearchModalComponent
  ]
})
export class ComponentsModule { }
