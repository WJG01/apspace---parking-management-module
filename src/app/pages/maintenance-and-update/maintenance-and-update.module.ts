import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MaintenanceAndUpdatePageRoutingModule } from './maintenance-and-update-routing.module';
import { MaintenanceAndUpdatePage } from './maintenance-and-update.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaintenanceAndUpdatePageRoutingModule,
    ComponentsModule
  ],
  declarations: [MaintenanceAndUpdatePage]
})
export class MaintenanceAndUpdatePageModule { }
