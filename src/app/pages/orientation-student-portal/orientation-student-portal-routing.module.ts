import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrientationStudentPortalPage } from './orientation-student-portal.page';

const routes: Routes = [
  {
    path: '',
    component: OrientationStudentPortalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrientationStudentPortalPageRoutingModule { }
