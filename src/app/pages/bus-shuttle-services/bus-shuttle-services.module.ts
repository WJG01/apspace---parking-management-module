import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { SharedPipesModule } from 'src/app/shared/shared-pipes.module';
import { BusShuttleServicesPage } from './bus-shuttle-services.page';
import { CheckPassedTimePipe } from './check-passed-time.pipe';
import { MinutesLeftPipe } from './minutes-left.pipe';

const routes: Routes = [
  {
    path: '',
    component: BusShuttleServicesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedPipesModule
  ],
  declarations: [BusShuttleServicesPage, CheckPassedTimePipe, MinutesLeftPipe]
})
export class BusShuttleServicesPageModule { }
