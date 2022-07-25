import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

import { PpMeta, Role } from 'src/app/interfaces';
import { StaffProfile } from 'src/app/interfaces';
import { PeoplepulseService, PpInfiniteScrollService, WsApiService } from 'src/app/services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  staffProfile$: Observable<StaffProfile[]>;
  indecitor = false;
  skeltons = [80, 30, 100, 45, 60, 76];
  meta: PpMeta = null;
  posts: any[];
  staff: StaffProfile;
  endLimit = 10;
  loadingMore = false;

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private scrollService: PpInfiniteScrollService,
    private storage: Storage,
  ) {}

  ngOnInit() {
    this.indecitor = true;
    this.scrollService.getObservable().subscribe(status => {
      if (!status) { return; }
      this.endLimit += 10;
      this.getPosts();
    });
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

    this.pp.getUserPosts(this.staff.ID, page).subscribe(
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
      }
    );
  }

  deletePost(postId) {
    this.posts = this.posts.filter((post) => post.id !== postId);
  }

  // ion-infinite-scroll scrolls too fast for some reason. for now use custom scroll
  // getPosts(event?: any) {
    // const page = this.meta === null
      // ? 1
      // : this.meta.has_next
        // ? this.meta.next_page
        // : -1; // means no more posts to fetch

    // if (page < 0) {
      // event.target.disabled = true
      // return;
    // }
    // // if (page > 1) { this.loadingMore = true; }

    // this.pp.getUserPosts(this.staff.ID, page).subscribe(
      // ({ meta, posts }) => {
        // this.meta = meta;
        // const fetchedPosts = posts
          // // .filter((p) => p.user_id === this.staff.ID)
          // .map((p) => ({
            // id: p.post_id,
            // content: p.post_content,
            // category: p.post_category,
            // datetime: p.datetime,
            // poster: this.staffs[this.staff.ID],
            // tagged: this.staffs[p.tags[0].staff_id],
          // }));

        // console.log(posts)
        // // if (this.loadingMore) { this.loadingMore = false; }
        // if (!this.posts) { this.posts = []; }
        // this.posts = [...this.posts, ...fetchedPosts];
        // event.target.complete

      // }
    // );
  // }
}
