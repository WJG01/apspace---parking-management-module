import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StaffDirectoryPageRoutingModule } from './staff-directory-routing.module';
import { StaffDirectoryPage } from './staff-directory.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffDirectoryPageRoutingModule,
    ComponentsModule
  ],
  declarations: [StaffDirectoryPage]
})
export class StaffDirectoryPageModule { }
