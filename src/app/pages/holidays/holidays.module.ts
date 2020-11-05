import { CommonModule , DatePipe} from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CalendarModule } from 'ion2-calendar';

import { ComponentsModule } from 'src/app/components/components.module';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { HolidaysPage } from './holidays.page';
import { PrettyDatePipe } from './pretty-date/pretty-date.pipe';

const routes: Routes = [
  {
    path: '',
    component: HolidaysPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    CalendarModule,
    SharedPipesModule
  ],
  providers: [DatePipe],
  declarations: [HolidaysPage, PrettyDatePipe]
})
export class HolidaysPageModule {}
