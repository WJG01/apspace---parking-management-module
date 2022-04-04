import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DatePickerComponent } from './date-picker/date-picker.component';
import { MessageWithSvgComponent } from './message-with-svg/message-with-svg.component';
import { NotFoundCardComponent } from './not-found-card/not-found-card.component';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { StaffDirectoryComponent } from './staff-directory/staff-directory.component';
import { SharedPipesModule } from '../shared/shared-pipes.module';

@NgModule({
  declarations: [
    DatePickerComponent,
    MessageWithSvgComponent,
    NotFoundCardComponent,
    SearchModalComponent,
    StaffDirectoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  exports: [
    DatePickerComponent,
    MessageWithSvgComponent,
    NotFoundCardComponent,
    SearchModalComponent,
    StaffDirectoryComponent
  ]
})
export class ComponentsModule { }
