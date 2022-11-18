import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OrientationStudentPortalPageRoutingModule } from './orientation-student-portal-routing.module';
import { OrientationStudentPortalPage } from './orientation-student-portal.page';
import { ViewStudentProfileModalPageModule } from './view-student-profile-modal/view-student-profile-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrientationStudentPortalPageRoutingModule,
    ViewStudentProfileModalPageModule
  ],
  declarations: [OrientationStudentPortalPage]
})
export class OrientationStudentPortalPageModule { }
