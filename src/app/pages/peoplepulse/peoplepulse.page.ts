import { Component, OnInit } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { filter, pairwise } from 'rxjs/operators';

import {
  PpFilterOptionsSelectable,
  PpMeta,
  Role,
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
  isFilterOpen = false;
  staff: StaffProfile;
  endLimit = 10;
  loadingMore = false;
  showMessage = true;

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private storage: Storage,
    private router: Router,
    private filterOptions: PpFilterOptionsService,
    private scrollService: PpInfiniteScrollService,
    public modalController: ModalController,
  ) {
    // check if previous page is /peoplepulse/add-post, fetch new post
    this.router.events
    .pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
    .subscribe((events: RoutesRecognized[]) => {
      const prevUrl = events[0].urlAfterRedirects;
      if (prevUrl === '/peoplepulse/add-post') {
        this.meta = this.posts = null;
        this.getPosts();
      }
    });
  }

  ngOnInit() {
    this.indecitor = true;
    this.getProfile();
    this.scrollService.getObservable().subscribe(status => {
      if (!status) { return; }
      this.endLimit += 10;
      this.getPosts();
    });
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
    const page = this.meta === null
      ? 1
      : this.meta.has_next
        ? this.meta.next_page
        : -1; // means no more posts to fetch

    if (page < 0) { return; }
    if (page > 1) { this.loadingMore = true; }

    this.pp.getPosts(this.staff.ID, page).subscribe(
      ({ meta, posts }) => {
        this.meta = meta;
        const fetchedPosts = posts.map((p) => ({
          id: p.post_id,
          content: p.post_content,
          category: p.post_category,
          datetime: p.datetime,
          poster: p.user_id,
          tagged: p.tags[0].tagged_user,
        }));

        if (this.loadingMore) { this.loadingMore = false; }
        if (!this.posts) { this.posts = []; }
        this.posts = [...this.posts, ...fetchedPosts];

        const clear = setInterval(() => {
          const target = document.querySelector(`#post-${this.endLimit }`);
          if (target) {
            clearInterval(clear);
            this.scrollService.setObserver().observe(target);
          }
        }, 1000);
      },
      (err) => console.log(err),
      () => {
        this.backupPosts = this.posts;
        this.pp.getFunctionalAreas(this.staff.ID).subscribe(
          funcAreas => {
            this.filterOptions.init(funcAreas);
          },
          (error) => console.log(error),
          () => {
            this.filterOptions.sharedOptions$.subscribe((opt) => {
              switch (opt.sortBy) {
                case 'name-asc': this.sortByName(true); break;
                case 'name-desc': this.sortByName(false); break;
                case 'date-asc': this.sortByDate(true); break;
                case 'date-desc': this.sortByDate(false); break;
              }
              this.filterCatFunc(opt.categories, opt.funcAreas);
            });
          }
      ); }
    );
  }

  deletePost(postId) {
    this.posts = this.posts.filter((post) => post.id !== postId);
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

  // for some reason can't filter category & func separately
  // TODO: fix in future
  filterCatFunc(cats: PpFilterOptionsSelectable[], areas: PpFilterOptionsSelectable[]) {
    const catNames = cats.filter((c) => c.selected).map((c) => c.name);
    const areaNames = areas.filter((f) => f.selected).map((f) => f.name);
    this.posts = this.backupPosts
      .filter((p) => catNames.indexOf(p.category.category) >= 0)
      .filter((p) => areaNames.indexOf(p.poster.functional_area.functional_area) >= 0);
  }

  hideMessage() {
    this.showMessage = false;
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

}
