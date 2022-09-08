import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { HrDownloadPageRoutingModule } from './hr-download-routing.module';

import { HrDownloadPage } from './hr-download.page';
import { FilterPipe } from './filter.pipe';
import { GenerateMonthImgPipe } from './generate-month-img.pipe';
import { GetDatePipe } from './get-date.pipe';

import { ComponentsModule } from '../../../components/components.module';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HrDownloadPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [HrDownloadPage, FilterPipe, GenerateMonthImgPipe, GetDatePipe],
  providers:[FileOpener]
})
export class HrDownloadPageModule {}
