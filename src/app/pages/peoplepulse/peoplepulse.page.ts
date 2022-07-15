import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
// import { share } from 'rxjs/operators';

import {
  PpFilterOptionsSelectable,
  PpMeta,
  Role,
  StaffDirectory,
  StaffProfile,
} from 'src/app/interfaces';
import {
  PeoplepulseService,
  PpFilterOptionsService,
  PpInfiniteScrollService,
  WsApiService,
} from 'src/app/services';
import { PpFilterModalComponent } from './pp-filter-modal/pp-filter-modal.component';

@Component({
  selector: 'app-peoplepulse',
  templateUrl: './peoplepulse.page.html',
  styleUrls: ['./peoplepulse.page.scss'],
})
export class PeoplepulsePage implements OnInit {
  staffProfile$: Observable<StaffProfile[]>;
  indecitor = false;
  meta: PpMeta = null;
  // TODO: implement these as actual interfaces so no guessing later
  posts: any[];
  backupPosts: any[] = [];
  staffs: any;
  isFilterOpen = false;
  staff: StaffProfile;
  endLimit = 10;
  loadingMore = false;

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private storage: Storage,
    private router: Router,
    private filterOptions: PpFilterOptionsService,
    private scrollService: PpInfiniteScrollService,
    public modalController: ModalController,
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
    );
    this.scrollService.getObservable().subscribe(status => {
      if (!status) return;
      this.endLimit += 10;
      this.getPosts();
    })
  }

  getProfile() {
    if (this.indecitor) {
      this.storage.get('role').then((role: Role) => {
        // tslint:disable-next-line:no-bitwise
        if (role & (Role.Lecturer | Role.Admin)) {
          this.staffProfile$ = this.ws.get<StaffProfile[]>('/staff/profile');
          this.staffProfile$.subscribe((staff) => {
            this.staff = staff[0];
            this.getPosts();
          });
        }
      });
      this.indecitor = false;
    }
  }

  getPosts() {
    let page = this.meta === null 
      ? 1 
      : this.meta.has_next
        ? this.meta.next_page
        : -1; // means no more posts to fetch

    console.log('page is', page)
    if (page < 0) return;
    console.log('fetching more posts...')
    if (page > 1) this.loadingMore = true;

    this.pp.getPosts(this.staff.ID, page).subscribe(
      ({ meta, posts }) => {
        this.meta = meta;
        const fetchedPosts = posts.map((p) => ({
          id: p.post_id,
          content: p.post_content,
          category: p.post_category,
          datetime: p.datetime,
          poster: this.staffs[p.user_id],
          tagged: this.staffs[p.tags[0].staff_id],
        }));

        if (this.loadingMore) this.loadingMore = false;
        if (!this.posts) this.posts = [];
        this.posts = [...this.posts, ...fetchedPosts];

        let clear = setInterval(() => {
          let target = document.querySelector(`#post-${this.endLimit - 3}`)
          if (target) {
            clearInterval(clear);
            this.scrollService.setObserver().observe(target)
          }
        }, 1000)
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
        });
      }
    );
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  async presentFilterModal() {
    const modal = await this.modalController.create({
      component: PpFilterModalComponent,
      // cssClass: 'filter-modal',
      swipeToClose: true,
    });
    await modal.present();
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

  navigateToAddPost() {
    this.router.navigate(['/peoplepulse/add-post']);
  }

  navigateToStaffs() {
    this.router.navigate(['/peoplepulse/staffs']);
  }

  navigateToProfile() {
    this.router.navigate(['/peoplepulse/profile']);
  }
  
  navigateToAdmin() {
    this.router.navigate(['/peoplepulse/admin']);
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
}
