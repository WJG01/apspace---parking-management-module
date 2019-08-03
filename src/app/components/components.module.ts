import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LecturerTimetableComponent } from './lecturer-timetable/lecturer-timetable.component';
import { SkeletonItemComponent } from './skeleton-item/skeleton-item.component';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner';
import { EventsListComponent } from './events-list/events-list.component';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';
import { QuickAccessItemComponent } from './quick-access-item/quick-access-item.component';
import { PopoverComponent } from './popover/popover.component';
import { LengthPipe } from './lecturer-timetable/length.pipe';
import { FromWeekPipe } from './lecturer-timetable/from-week.pipe';

@NgModule({
  declarations: [
    LecturerTimetableComponent,
    SkeletonItemComponent,
    SearchModalComponent,
    LoadingSpinnerComponent,
    EventsListComponent,
    DashboardCardComponent,
    QuickAccessItemComponent,
    PopoverComponent,
    LengthPipe,
    FromWeekPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [
    LecturerTimetableComponent,
    SkeletonItemComponent,
    SearchModalComponent,
    LoadingSpinnerComponent,
    EventsListComponent,
    DashboardCardComponent,
    QuickAccessItemComponent,
    PopoverComponent
  ],
  entryComponents: [
    SearchModalComponent,
    PopoverComponent
  ]
})
export class ComponentsModule { }
