import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClassroomFinderPage } from './classroom-finder.page';

const routes: Routes = [
  {
    path: '',
    component: ClassroomFinderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassroomFinderPageRoutingModule { }
