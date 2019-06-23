import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { DeauthGuard } from './guards/deauth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginPageModule',
    canActivate: [DeauthGuard]
  },
  {
    path: 'tabs',
    loadChildren: './pages/tabs/tabs.module#TabsPageModule',
    canActivate: [AuthGuard]
  },
  
  {
    path: 'student-timetable',
    loadChildren: './pages/student-timetable/student-timetable.module#StudentTimetablePageModule'
  },
  {
    path: 'staffs',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: './pages/staff-directory/staff-directory.module#StaffDirectoryPageModule'
      }
    ]
  },
  { path: 'staff', loadChildren: './pages/staff-directory-info/staff-directory-info.module#StaffDirectoryInfoPageModule' },
  {
    path: 'attendix-lecturer',
    // canActivate: [AuthGuard],
    children: [
      { path: 'classes', loadChildren: './pages/attendix/attendix-lecturer/classes/classes.module#ClassesPageModule' },
      { path: 'take-attendance', loadChildren: './pages/attendix/attendix-lecturer/take-attendance/take-attendance.module#TakeAttendancePageModule' },
      // { path: 'qr-otp', loadChildren: './pages/attendix/qr-otp/qr-otp.module#QrOtpPageModule' },
      // { path: 'take-picture', loadChildren: './pages/attendix/take-picture/take-picture.module#TakePicturePageModule' },
    ]
  },
  {
    path: 'feedback',
    loadChildren: './pages/feedback/feedback.module#FeedbackPageModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }