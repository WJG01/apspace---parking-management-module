import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, share } from 'rxjs';

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
    private storage: Storage
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.staffs$ = this.ws.get<StaffDirectory[]>('/staff/listing', { caching: 'cache-only' }).pipe(
      share()
    );

    this.storage.get('role').then((role: Role) => {
      // tslint:disable-next-line: no-bitwise
      this.isStudent = Boolean(role & Role.Student);
    });
  }

  openIConsult() {
    console.log(this.id);
  }

  chatInTeams() {
    console.log(this.id);
  }
}
