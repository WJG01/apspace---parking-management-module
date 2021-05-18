import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MoodleEventsModalPage } from './moodle-events-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [MoodleEventsModalPage],
  exports: [],
})

export class MoodleEventsPageModalModule {

}
