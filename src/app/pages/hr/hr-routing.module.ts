import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { Role } from 'src/app/interfaces';
import { HrPage } from './hr.page';

const routes: Routes = [
  {
    path: '',
    component: HrPage
  },
  {
    path: 'hr-download',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer},
    loadChildren: () => import('./hr-download/hr-download.module').then( m => m.HrDownloadPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HrPageRoutingModule {}
