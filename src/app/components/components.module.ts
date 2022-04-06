import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { DatePickerComponent } from './date-picker/date-picker.component';
import { MessageWithSvgComponent } from './message-with-svg/message-with-svg.component';
import { NotFoundCardComponent } from './not-found-card/not-found-card.component';
import { SearchModalComponent } from './search-modal/search-modal.component';

@NgModule({
  declarations: [
    DatePickerComponent,
    MessageWithSvgComponent,
    NotFoundCardComponent,
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
    NotFoundCardComponent,
    SearchModalComponent
  ]
})
export class ComponentsModule { }
