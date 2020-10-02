import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StaffDirectoryModule } from 'src/app/components/staff-directory/staff-directory.module';
import { ComponentsModule } from '../../../components/components.module';
import { FilterPipe } from './filter.pipe';
import { GenerateMonthImgPipe } from './generate-month-img.pipe';
import { GetDatePipe } from './get-date.pipe';
import { HrDownloadPageRoutingModule } from './hr-download-routing.module';
import { HrDownloadPage } from './hr-download.page';
import { SearchedFilesDisplayComponent } from './searched-files-display/searched-files-display.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    HrDownloadPageRoutingModule,
    StaffDirectoryModule
  ],
  declarations: [HrDownloadPage, SearchedFilesDisplayComponent, GetDatePipe, GenerateMonthImgPipe, FilterPipe]
})
export class HrDownloadPageModule { }
