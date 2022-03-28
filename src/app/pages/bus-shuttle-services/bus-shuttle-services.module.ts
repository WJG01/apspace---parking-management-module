import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { BusShuttleServicesPageRoutingModule } from './bus-shuttle-services-routing.module';
import { BusShuttleServicesPage } from './bus-shuttle-services.page';
import { CheckPassedTimePipe } from './check-passed-time/check-passed-time.pipe';
import { MinutesLeftPipe } from './minutes-left/minutes-left.pipe';
import { SharedPipesModule } from '../../shared/shared-pipes.module';
import { DateWithTimezonePipe } from '../../shared/date-with-timezone/date-with-timezone.pipe';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BusShuttleServicesPageRoutingModule,
    SharedPipesModule,
    ComponentsModule
  ],
  declarations: [BusShuttleServicesPage, CheckPassedTimePipe, MinutesLeftPipe],
  providers: [DateWithTimezonePipe]
})
export class BusShuttleServicesPageModule { }
