import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard, DeauthGuard } from './guards';
import { Role } from './interfaces';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [DeauthGuard],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'attendance',
    canActivate: [AuthGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./pages/attendance/attendance.module').then(m => m.AttendancePageModule)
  },
  {
    path: 'apcard',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/apcard/apcard.module').then(m => m.ApcardPageModule)
  },
  {
    path: 'notifications',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule)
  },
  {
    path: 'exam-schedule',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/exam-schedule/exam-schedule.module').then(m => m.ExamSchedulePageModule)
  },
  {
    path: 'bus-shuttle-services',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/bus-shuttle-services/bus-shuttle-services.module').then(m => m.BusShuttleServicesPageModule)
  },
  {
    path: 'student-survey',
    canActivate: [AuthGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./pages/student-survey/student-survey.module').then(m => m.StudentSurveyPageModule)
  },
  {
    path: 'feedback',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackPageModule)
  },
  {
    path: 'unauthorized',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/unauthorized/unauthorized.module').then(m => m.UnauthorizedPageModule)
  },
  { // this path must always be at the end of the routes array
    path: '**',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
