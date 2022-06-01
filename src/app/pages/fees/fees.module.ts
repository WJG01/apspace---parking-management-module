import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { NgChartsModule } from 'ng2-charts';

import { FeesPageRoutingModule } from './fees-routing.module';
import { FeesPage } from './fees.page';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeesPageRoutingModule,
    SharedPipesModule,
    NgChartsModule,
    ComponentsModule
  ],
  declarations: [FeesPage]
})
export class FeesPageModule { }
