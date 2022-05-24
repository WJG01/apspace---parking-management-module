import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeoplepulsePage } from './peoplepulse.page';

const routes: Routes = [
  {
    path: '',
    component: PeoplepulsePage,
  },
  {
    path: 'add-post',
    loadChildren: () => import('./pages/add-post/add-post.module').then((m) => m.AddPostPageModule),
  },
  {
    path: 'staffs',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/staff-directory/staff-directory.module').then(
            (m) => m.StaffDirectoryPageModule
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./pages/staff-directory-info/staff-directory-info.module').then(
            (m) => m.StaffDirectoryInfoPageModule
          ),
      },
    ],
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then((m) => m.ProfilePageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeoplepulsePageRoutingModule {}
