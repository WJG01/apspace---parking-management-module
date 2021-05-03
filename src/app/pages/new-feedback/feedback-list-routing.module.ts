import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FeedbackListPage } from './feedback-list.page';

const routes: Routes = [
  {
    path: '',
    component: FeedbackListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedbackListPageRoutingModule {}
