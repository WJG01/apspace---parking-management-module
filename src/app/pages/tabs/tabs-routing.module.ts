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
        path: 'student-timetable',
        canActivate: [AuthGuard],
        data: { role: Role.Student },
        loadChildren: () => import('../student-timetable/student-timetable.module').then(m => m.StudentTimetablePageModule)
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        // tslint:disable-next-line:no-bitwise
        data: { role: Role.Lecturer | Role.Admin },
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
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
        canActivate: [AuthGuard],
        data: { role: Role.Lecturer },
        path: 'lecturer-timetable',
        loadChildren: () => import('../lecturer-timetable/lecturer-timetable.module').then(m => m.LecturerTimetablePageModule)
      },
      {
        path: 'more',
        canActivate: [AuthGuard],
        data: { role: Role.Student | Role.Lecturer | Role.Admin },
        loadChildren: () => import('../more/more.module').then(m => m.MorePageModule)
      },
      {
        path: 'parking-book',
        loadChildren: () => import('../parking-book/parking-book.module').then(m => m.BookParkingPageModule)
      },
      {
        path: 'parking-checkin',
        loadChildren: () => import('../parking-checkin/parking-checkin.module').then(m => m.ParkingCheckinPageModule)
      },
      {
        path: 'parking-emergency',
        loadChildren: () => import('../parking-emergency/parking-emergency.module').then(m => m.ParkingEmergencyPageModule)
      },
      {
        path: 'parking-emergency-assistance',
        loadChildren: () => import('../parking-emergency-assist/parking-emergency-assist.module').then(m => m.ParkingEmergencyAssistPageModule)
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
