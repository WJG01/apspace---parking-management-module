import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { LecturerTimetableComponentModule } from 'src/app/components/lecturer-timetable/lecturer-timetable.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AppLauncherService } from 'src/app/services';
import { PpComponentsModule } from '../../components/components.module';
import { ByIdPipe } from './by-id.pipe';
import { StaffDirectoryInfoPage } from './staff-directory-info.page';

const routes: Routes = [
  {
    path: ':id',
    component: StaffDirectoryInfoPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    LecturerTimetableComponentModule,
    PipesModule,
    PpComponentsModule,
  ],
  providers: [AppLauncherService],
  declarations: [StaffDirectoryInfoPage, ByIdPipe],
})
export class StaffDirectoryInfoPageModule {}
