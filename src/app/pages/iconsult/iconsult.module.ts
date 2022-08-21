import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards';
import { Role } from '../../interfaces';
import { RedirectGuard } from './redirect/redirect.guard';

const routes: Routes = [
  {
    path: 'add-free-slot',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer },
    loadChildren: () => import('./staffs/add-free-slot/add-free-slot.module').then(m => m.AddFreeSlotPageModule)
  },
  {
    path: 'consultations',
    canActivate: [AuthGuard],
    data: { role: Role.Admin | Role.Lecturer },
    loadChildren: () => import('./staffs/consultations/consultations.module').then(m => m.ConsultationsPageModule)
  },
  {
    path: 'appointments',
    canActivate: [AuthGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./students/appointments/appointments.module').then(m => m.AppointmentsPageModule)
  },
  {
    path: '',
    canActivate: [RedirectGuard]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class IconsultModule { }
