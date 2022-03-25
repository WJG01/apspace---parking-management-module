import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Role } from '../../interfaces';
import { AuthGuard } from '../../guards';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { role: Role.Student | Role.Lecturer | Role.Admin },
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'attendance',
        canActivate: [AuthGuard],
        data: { role: Role.Student },
        loadChildren: () => import('../attendance/attendance.module').then(m => m.AttendancePageModule)
      },
      {
        path: 'apcard',
        canActivate: [AuthGuard],
        data: { role: Role.Student | Role.Lecturer | Role.Admin },
        loadChildren: () => import('../apcard/apcard.module').then(m => m.ApcardPageModule)
      },
      {
        path: 'more',
        canActivate: [AuthGuard],
        data: { role: Role.Student | Role.Lecturer | Role.Admin },
        loadChildren: () => import('../more/more.module').then(m => m.MorePageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
