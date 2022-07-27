import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

import {
  Role,
  StaffProfile,
} from 'src/app/interfaces';
import { PeoplepulseService, WsApiService } from 'src/app/services';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  staffProfile$: Observable<StaffProfile[]>;
  staff: StaffProfile;
  indecitor = false;
  dept = '';
  funcAreas: any;
  staffs: any;

  constructor(private pp: PeoplepulseService, private ws: WsApiService, private storage: Storage) { }

  ngOnInit() {
    this.indecitor = true;
    this.getProfile();
  }

  getProfile() {
    if (this.indecitor) {
      this.storage.get('role').then((role: Role) => {
        // tslint:disable-next-line:no-bitwise
        if (role & (Role.Lecturer | Role.Admin)) {
          this.staffProfile$ = this.ws.get<StaffProfile[]>('/staff/profile');
          this.staffProfile$.subscribe((staff) => {
            this.staff = staff[0];
            this.getStaffs();
          });
        }
      });
      this.indecitor = false;
    }
  }

  getStaffs() {
    this.pp.getUsers(this.staff.ID).subscribe(u => {
      this.funcAreas = [...(new Set(u.map((i) => i.functional_area_id.functional_area)))];
      this.staffs = u;
      console.log(this.staffs);
    });
  }

  toggleFuncArea(id) {
    this.funcAreas = this.funcAreas.map((i) => (i.functional_area_id === id ? {...i, open: !i.open} : i));
  }

  onPermissionChange(user) {
    this.pp.editUserSettings(this.staff.ID, user.id, user.status, user.user_acl, user.admin_access).subscribe();
  }

}
