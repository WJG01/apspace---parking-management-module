import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewStudentPage } from './view-student.page';

const routes: Routes = [
  {
    path: '',
    component: ViewStudentPage
  },
  {
    path: 'show-details',
    loadChildren: () => import('./show-details/show-details.module').then(m => m.ShowDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewStudentPageRoutingModule {}
