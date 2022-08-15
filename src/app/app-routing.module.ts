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
    path: 'student-timetable',
    canActivate: [AuthGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./pages/student-timetable/student-timetable.module').then(m => m.StudentTimetablePageModule)
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
  {
    path: 'anonymous-feedback',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/anonymous-feedback/anonymous-feedback.module').then(m => m.AnonymousFeedbackPageModule)
  },
  {
    path: 'staffs',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/staff-directory/staff-directory.module').then(m => m.StaffDirectoryPageModule)
      },
      {
        path: ':id',
        loadChildren: () => import('./pages/staff-directory/staff-directory-info/staff-directory-info.module').then(m => m.StaffDirectoryInfoPageModule)
      }
    ]
  },
  {
    path: 'attendix',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/attendix/attendix.module').then(m => m.AttendixModule)
  },
  {
    path: 'results',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/results/results.module').then(m => m.ResultsPageModule)
  },
  {
    path: 'operation-hours',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/operation-hours/operation-hours.module').then(m => m.OperationHoursPageModule)
  },
  {
    path: 'classroom-finder',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/classroom-finder/classroom-finder.module').then(m => m.ClassroomFinderPageModule)
  },
  {
    path: 'fees',
    canActivate: [AuthGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./pages/fees/fees.module').then(m => m.FeesPageModule)
  },
  {
    path: 'about',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: 'set-security-questions',
        loadChildren: () => import('./pages/settings/set-security-questions/set-security-questions.module').then(m => m.SetSecurityQuestionsPageModule)
      },
      {
        path: 'change-password',
        loadChildren: () => import('./pages/settings/change-password/change-password.module').then(m => m.ChangePasswordPageModule)
      },
      {
        path: 'change-webspace-password',
        loadChildren: () => import('./pages/settings/change-webspace-password/change-webspace-password.module').then(m => m.ChangeWebspacePasswordPageModule)
      },
      {
        path: 'reset-webspace-password',
        loadChildren: () => import('./pages/settings/reset-webspace-password/reset-webspace-password.module').then(m => m.ResetWebspacePasswordPageModule)
      }
    ]
  },
  {
    path: 'iconsult',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/iconsult/iconsult.module').then(m => m.IconsultModule)
  },
  {
    path: 'news',
    loadChildren: () => import('./pages/news/news.module').then( m => m.NewsPageModule)
  },
  {
    path: 'exam-schedule-admin',
    loadChildren: () => import('./pages/exam-schedule-admin/exam-schedule-admin.module').then( m => m.ExamScheduleAdminPageModule)
  },
  {
    path: 'exam-schedule-details/:examId',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/exam-schedule-admin/exam-schedule-details/exam-schedule-details.module').then(m => m.ExamScheduleDetailsPageModule)
  },
  {
    path: 'graduate-verification-service',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/graduate-verification-service/graduate-verification-service.module').then( m => m.GraduateVerificationServicePageModule)
  },
  { // this path must always be at the end of the routes array
    path: '**',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
