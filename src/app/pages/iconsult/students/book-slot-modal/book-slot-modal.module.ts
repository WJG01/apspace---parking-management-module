import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { BookSlotModalPage } from './book-slot-modal.page';
import { SharedPipesModule } from '../../../../shared/shared-pipes.module';
import { DateWithTimezonePipe } from '../../../../shared/date-with-timezone/date-with-timezone.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  declarations: [BookSlotModalPage],
  providers: [DateWithTimezonePipe]
})
export class BookSlotModalPageModule { }
