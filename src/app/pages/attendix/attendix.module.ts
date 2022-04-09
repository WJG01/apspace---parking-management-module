import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards';
import { Role } from '../../interfaces';
import { GraphQLModule } from '../../graphql.module';

const routes: Routes = [
  {
    path: 'classes',
    canActivate: [AuthGuard],
    data: { role: Role.Lecturer | Role.Admin },
    loadChildren: () => import('./classes/classes.module').then(m => m.ClassesPageModule)
  },
]


@NgModule({
  imports: [
    CommonModule,
    GraphQLModule,
    RouterModule.forChild(routes)
  ]
})
export class AttendixModule { }
