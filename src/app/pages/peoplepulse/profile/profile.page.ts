import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

import { PpMeta, Role, StaffDirectory } from 'src/app/interfaces';
import { StaffProfile } from 'src/app/interfaces';
import { PeoplepulseService, WsApiService } from 'src/app/services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  staffProfile$: Observable<StaffProfile[]>;
  indecitor = false;
  skeltons = [80, 30, 100, 45, 60, 76];
  // for demo purpose until can test with a staff acc...
  staffProfile = [
    {
      ID: 'mustafa',
      FULLNAME: 'MUSTAFA OTHMAN',
      TITLE: 'Manager, Software Development',
      PHOTO: 'https://d37plr7tnxt7lb.cloudfront.net/436.jpg',
      CURRENT_JOB_TYPE: '',
      NATIONALITY: '',
      DEPARTMENT: 'Centre of Technology and Innovation',
      DEPARTMENT2: '',
      DEPARTMENT3: '',
    },
  ];
  meta: PpMeta;
  posts: any[] = [];
  staffs: any;

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private storage: Storage,
  ) {}

  ngOnInit() {
    this.indecitor = true;
    this.ws.get<StaffDirectory[]>('/staff/listing', { caching: 'cache-only' }).subscribe(
      (staffs) => {
        this.staffs = staffs.reduce(
          (acc, cur) => ({
            ...acc,
            [cur.ID]: {
              id: cur.ID,
              name: cur.FULLNAME,
              dep: cur.DEPARTMENT,
              photo: cur.PHOTO,
            },
          }),
          {}
        );
      },
      (err) => console.log(err),
      // () => this.getPosts()
    );
  }

  ionViewDidEnter() {
    this.getProfile();
  }

  getProfile() {
    if (this.indecitor) {
      this.storage.get('role').then((role: Role) => {
        // tslint:disable-next-line:no-bitwise
        if (role & (Role.Lecturer | Role.Admin)) {
          this.staffProfile$ = this.ws.get<StaffProfile[]>('/staff/profile');
          this.staffProfile$.subscribe((staff) => this.getPosts(staff[0].ID));
        }
      });
      this.indecitor = false;
    }
  }

  getPosts(staffId) {
    this.pp.getPosts(staffId).subscribe(
      ({ meta, posts }) => {
        this.meta = meta;
        this.posts = posts
          .filter((p) => p.user_id === 'mustafa')
          .map((p) => ({
            id: p.post_id,
            content: p.post_content,
            category: p.post_category,
            datetime: p.datetime,
            poster: this.staffs.mustafa,
            tagged: this.staffs[p.tags[0].tag_id],
          }));
      }
      // (err) => console.log(err),
      // (_) => sortNFilter()
    );
  }
}
