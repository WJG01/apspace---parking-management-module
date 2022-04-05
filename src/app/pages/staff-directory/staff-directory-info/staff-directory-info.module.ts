import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StaffDirectoryInfoPageRoutingModule } from './staff-directory-info-routing.module';
import { StaffDirectoryInfoPage } from './staff-directory-info.page';
import { ByIdPipe } from './by-id/by-id.pipe';
import { ComponentsModule } from '../../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffDirectoryInfoPageRoutingModule,
    ComponentsModule
  ],
  declarations: [StaffDirectoryInfoPage, ByIdPipe]
})
export class StaffDirectoryInfoPageModule { }
