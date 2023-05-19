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
      },
      {
        path: ':id/consultations',
        loadChildren: () => import('./pages/iconsult/students/opened-slots/opened-slots.module').then(m => m.OpenedSlotsPageModule)
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
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/news/news.module').then(m => m.NewsPageModule)
  },
  {
    path: 'exam-schedule-admin',
    canActivate: [AuthGuard],
    data: { role: Role.Admin },
    loadChildren: () => import('./pages/exam-schedule-admin/exam-schedule-admin.module').then(m => m.ExamScheduleAdminPageModule)
  },
  {
    path: 'exam-schedule-details/:examId',
    canActivate: [AuthGuard],
    data: { role: Role.Admin },
    loadChildren: () => import('./pages/exam-schedule-admin/exam-schedule-details/exam-schedule-details.module').then(m => m.ExamScheduleDetailsPageModule)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'visa-status',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Student },
    loadChildren: () => import('./pages/profile/visa-status/visa-status.module').then(m => m.VisaStatusPageModule)
  },
  {
    path: 'mentorship',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/mentorship/mentorship.module').then(m => m.MentorshipPageModule)
  },
  {
    path: 'beapu',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/filing-report/filing-report.module').then(m => m.FilingReportPageModule)
  },
  {
    path: 'logout',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/logout/logout.module').then(m => m.LogoutPageModule)
  },
  {
    // Don't need AuthGuard as this page can be accessible from Login
    path: 'graduate-verification-service',
    loadChildren: () => import('./pages/graduate-verification-service/graduate-verification-service.module').then(m => m.GraduateVerificationServicePageModule)
  },
  {
    path: 'aplc-progress-report',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/aplc-progression/aplc-progression.module').then(m => m.AplcProgressionPageModule)
  },
  {
    path: 'holidays',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/holidays/holidays.module').then(m => m.HolidaysPageModule)
  },
  {
    path: 'maintenance-and-update',
    loadChildren: () => import('./pages/maintenance-and-update/maintenance-and-update.module').then(m => m.MaintenanceAndUpdatePageModule)
  },
  {
    path: 'covid-forms',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/covid-forms/covid-forms.module').then(m => m.CovidFormsPageModule)
  },
  {
    path: 'covid-information-form',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/covid-forms/covid-information-form/covid-information-form.module').then(m => m.CovidInformationFormPageModule)
  },
  {
    path: 'covid-rtk-form',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/covid-forms/covid-rtk-form/covid-rtk-form.module').then(m => m.CovidRtkFormPageModule)
  },
  {
    path: 'covid-pcr-form',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/covid-forms/covid-pcr-form/covid-pcr-form.module').then(m => m.CovidPcrFormPageModule)
  },
  {
    path: 'apcard-qr-code',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Lecturer | Role.Admin },
    loadChildren: () => import('./pages/apcard-qr-code/apcard-qr-code.module').then(m => m.ApcardQrCodePageModule)
  },
  {
    path: 'hr',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/hr/hr.module').then(m => m.HrPageModule)
  },
  {
    path: 'library',
    canActivate: [AuthGuard],
    data: { role: Role.Student | Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/library/library.module').then(m => m.LibraryPageModule)
  },
  {
    path: 'orientation-student-portal',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/orientation-student-portal/orientation-student-portal.module').then(m => m.OrientationStudentPortalPageModule)
  },
  {
    // only available via URL. No Menu item created for this
    path: 'igraduate',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer },
    loadChildren: () => import('./pages/igraduate/igraduate.module').then(m => m.IgraduatePageModule)
  },
  {
    path: 'lecturer-timetable',
    canActivate: [AuthGuard],
    data: { role: Role.Lecturer },
    loadChildren: () => import('./pages/lecturer-timetable/lecturer-timetable.module').then(m => m.LecturerTimetablePageModule)
  },
  {
    path: 'book-parking',
    loadChildren: () => import('./pages/book-parking/book-parking.module').then( m => m.BookParkingPageModule)
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
