import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DatePickerComponent } from './date-picker/date-picker.component';
import { FeesCardComponent } from './fees-card/fees-card.component';
import { LecturerTimetableComponent } from './lecturer-timetable/lecturer-timetable.component';
import { MessageWithSvgComponent } from './message-with-svg/message-with-svg.component';
import { NotFoundCardComponent } from './not-found-card/not-found-card.component';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { StaffDirectoryComponent } from './staff-directory/staff-directory.component';
import { SharedPipesModule } from '../shared/shared-pipes.module';
import { FormatByDayPipe } from './lecturer-timetable/format-by-day/format-by-day.pipe';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [
    DatePickerComponent,
    FeesCardComponent,
    LecturerTimetableComponent,
    MessageWithSvgComponent,
    NotFoundCardComponent,
    SearchModalComponent,
    StaffDirectoryComponent,
    LoadingSpinnerComponent,
    FormatByDayPipe
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
    FeesCardComponent,
    LecturerTimetableComponent,
    MessageWithSvgComponent,
    NotFoundCardComponent,
    SearchModalComponent,
    StaffDirectoryComponent,
    LoadingSpinnerComponent
  ]
})
export class ComponentsModule { }
