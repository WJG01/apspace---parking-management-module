import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SharedPipesModule } from 'src/app/shared/shared-pipes.module';
import { ComponentsModule } from '../components.module';
import { DepartmentPipe } from './department.pipe';
import { StaffDirectoryComponent } from './staff-directory.component';

@NgModule({
  declarations: [StaffDirectoryComponent, DepartmentPipe],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ComponentsModule,
    RouterModule,
    SharedPipesModule
  ],
  exports: [StaffDirectoryComponent]
})
export class StaffDirectoryModule { }
