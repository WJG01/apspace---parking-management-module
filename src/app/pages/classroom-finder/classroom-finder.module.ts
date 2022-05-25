import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ClassroomFinderPageRoutingModule } from './classroom-finder-routing.module';
import { ClassroomFinderPage } from './classroom-finder.page';
import { ComponentsModule } from '../../components/components.module';
import { ByRoomsPipe } from './by-rooms/by-rooms.pipe';
import { ByTimePipe } from './by-time/by-time.pipe';
import { ByLocationPipe } from './by-location/by-location.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassroomFinderPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ClassroomFinderPage, ByRoomsPipe, ByTimePipe, ByLocationPipe]
})
export class ClassroomFinderPageModule { }
