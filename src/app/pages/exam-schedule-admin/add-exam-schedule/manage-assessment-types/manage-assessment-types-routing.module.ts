import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAssessmentTypesPage } from './manage-assessment-types.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAssessmentTypesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAssessmentTypesPageRoutingModule {}
