import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, share } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { Role, StaffDirectory } from '../../../interfaces';
import { WsApiService } from '../../../services';

@Component({
  selector: 'app-staff-directory-info',
  templateUrl: './staff-directory-info.page.html',
  styleUrls: ['./staff-directory-info.page.scss'],
})
export class StaffDirectoryInfoPage implements OnInit {

  id: string;
  staffs$: Observable<StaffDirectory[]>;
  isStudent = false;

  constructor(
    private route: ActivatedRoute,
    private ws: WsApiService,
    private storage: Storage,
    private router: Router
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.staffs$ = this.ws.get<StaffDirectory[]>('/staff/listing', { caching: 'cache-only' }).pipe(
      map(staffs => {
        for (let staff of staffs) {
          staff.IMAGEURL = `https://d37plr7tnxt7lb.cloudfront.net/${staff.RefNo}.jpg`;
        }

        return staffs;
      }),
      share()
    );

    this.storage.get('role').then((role: Role) => {
      // tslint:disable-next-line: no-bitwise
      this.isStudent = Boolean(role & Role.Student);
    });
  }

  openIConsult() {
    this.router.navigate(['staffs', this.id, 'consultations']);
  }

  chatInTeams() {
    console.log(this.id);
  }
}
