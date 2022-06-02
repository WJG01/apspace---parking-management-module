import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
// import { share } from 'rxjs/operators';

import {
  PpFilterOptionsSelectable,
  PpMeta,
  Role,
  StaffDirectory,
  StaffProfile,
  StudentPhoto,
} from 'src/app/interfaces';
import {
  PeoplepulseService,
  PpFilterOptionsService,
  WsApiService
} from 'src/app/services';
import { PpFilterModalComponent } from './pp-filter-modal/pp-filter-modal.component';

@Component({
  selector: 'app-peoplepulse',
  templateUrl: './peoplepulse.page.html',
  styleUrls: ['./peoplepulse.page.scss'],
})
export class PeoplepulsePage implements OnInit {
  photo$: Observable<StudentPhoto>;
  staffProfile$: Observable<StaffProfile[]>;
  indecitor = false;
  meta: PpMeta;
  // TODO: implement these as actual interfaces so no guessing later
  posts: any[] = [];
  backupPosts: any[] = [];
  staffs: any;
  isFilterOpen = false;

  // throw
  studentRole = false;
  intakeModified = false;
  timetableAndExamScheduleIntake = '';

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private storage: Storage,
    private filterOptions: PpFilterOptionsService,
    public popoverController: PopoverController,
  ) {}

  ngOnInit() {
    this.indecitor = true;
    this.getProfile();
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

  // ionViewDidEnter() {
  // }

  getProfile() {
    if (this.indecitor) {
      this.storage.get('role').then((role: Role) => {
        // TODO: remove this when get staff account
        // tslint:disable-next-line:no-bitwise
        if (role & Role.Student) {
          this.studentRole = true;
          this.photo$ = this.ws.get<StudentPhoto>('/student/photo');
          // tslint:disable-next-line:no-bitwise
        } else if (role & (Role.Lecturer | Role.Admin)) {
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
        this.posts = posts.map((p) => ({
          id: p.post_id,
          content: p.post_content,
          category: p.post_category,
          datetime: p.datetime,
          poster: this.staffs[p.user_id],
          tagged: this.staffs[p.tags[0].staff_id],
        }));
      },
      (err) => console.log(err),
      () => {
        this.backupPosts = this.posts;
        this.filterOptions.sharedOptions$.subscribe((opt) => {
          switch (opt.sortBy) {
            case 'Name':
              this.sortByName(opt.isSortedAsc);
              break;
            case 'Date':
              this.sortByDate(opt.isSortedAsc);
              break;
          }
          this.filterCatFunc(opt.categories, opt.funcAreas);
          // this.filterFuncAreas(opt.funcAreas);
        });
      }
    );
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  async presentFilterModal() {
    const popover = await this.popoverController.create({
      component: PpFilterModalComponent,
      cssClass: 'filter-modal',
      translucent: true,
    });
    await popover.present();
  }

  // here don't forget to sort the backup posts
  sortByName(isSortedAsc: boolean) {
    this.posts.sort((a, b) => {
      const name1 = isSortedAsc ? a.poster.name : b.poster.name;
      const name2 = !isSortedAsc ? a.poster.name : b.poster.name;
      return name1 > name2 ? 1 : name2 > name1 ? -1 : 0;
    });
    this.backupPosts.sort((a, b) => {
      const name1 = isSortedAsc ? a.poster.name : b.poster.name;
      const name2 = !isSortedAsc ? a.poster.name : b.poster.name;
      return name1 > name2 ? 1 : name2 > name1 ? -1 : 0;
    });
  }

  sortByDate(isSortedAsc: boolean) {
    this.posts.sort((a, b) => {
      const dateA = new Date(a.datetime),
        dateB = new Date(b.datetime);
      const date1 = isSortedAsc ? dateA : dateB;
      const date2 = !isSortedAsc ? dateA : dateB;
      return date1.valueOf() - date2.valueOf();
    });
    this.backupPosts.sort((a, b) => {
      const dateA = new Date(a.datetime),
        dateB = new Date(b.datetime);
      const date1 = isSortedAsc ? dateA : dateB;
      const date2 = !isSortedAsc ? dateA : dateB;
      return date1.valueOf() - date2.valueOf();
    });
  }

  // for some reason can't filter category & func separately
  // TODO: fix in future
  filterCatFunc(cats: PpFilterOptionsSelectable[], areas: PpFilterOptionsSelectable[]) {
    const catNames = cats.filter((c) => c.selected).map((c) => c.name);
    const areaNames = areas.filter((f) => f.selected).map((f) => f.name);
    this.posts = this.backupPosts
      .filter((p) => catNames.indexOf(p.category) >= 0)
      .filter((p) => areaNames.indexOf(p.poster.dep) >= 0);
  }

  // filterFuncAreas(areas: PpFilterOptionsSelectable[]) {
  // const areaNames = areas.filter((f) => f.selected).map((f) => f.name)
  // this.posts = this.backupPosts.filter((p) => areaNames.indexOf(p.poster.dep) >= 0)
  // }
}
