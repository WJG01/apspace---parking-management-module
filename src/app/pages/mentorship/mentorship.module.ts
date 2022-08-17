import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MentorshipPageRoutingModule } from './mentorship-routing.module';
import { MentorshipPage } from './mentorship.page';
import { FilterPipe } from './pipes/filter.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MentorshipPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MentorshipPage, FilterPipe, SearchPipe]
})
export class MentorshipPageModule {}
