import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AddNewStudentComponent } from './add-new-student/add-new-student.component';

import { OrientatonStudentPortalPageRoutingModule } from './orientaton-student-portal-routing.module';

import { OrientatonStudentPortalPage } from './orientaton-student-portal.page';
import { ViewStudentProfileModalPage } from './view-student-profile/view-student-profile-modal';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrientatonStudentPortalPageRoutingModule
  ],
  declarations: [OrientatonStudentPortalPage, ViewStudentProfileModalPage, AddNewStudentComponent],
  entryComponents: [ViewStudentProfileModalPage, AddNewStudentComponent]
})
export class OrientatonStudentPortalPageModule {}
