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
    loadChildren: () => import('./add-post/add-post.module').then((m) => m.AddPostPageModule),
  },
  {
    path: 'staffs',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./staff-directory/staff-directory.module').then(
            (m) => m.StaffDirectoryPageModule
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./staff-directory-info/staff-directory-info.module').then(
            (m) => m.StaffDirectoryInfoPageModule
          ),
      },
    ],
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeoplepulsePageRoutingModule {}
