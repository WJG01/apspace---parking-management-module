import { Component, OnInit } from '@angular/core';

import { PpMeta, StaffDirectory } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';
import { PeoplepulseService } from '../../services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
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

  constructor(private ws: WsApiService, private pp: PeoplepulseService) {}

  ngOnInit() {
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
      () => this.getPosts()
    );
  }

  getPosts() {
    this.pp.getPosts().subscribe(
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
