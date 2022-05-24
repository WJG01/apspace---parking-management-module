import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import { PpCategory, PpPost, PpPostwMeta, StaffDirectory } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';
import { PeoplepulseService } from '../../services';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements OnInit {
  staffs$: Observable<StaffDirectory[]>;
  staff: StaffDirectory = null;
  categories: PpCategory[] = [];
  category: PpCategory = null;
  content = '';
  isStaffOpen = false;
  isCatsOpen = false;
  posts: PpPostwMeta;

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private location: Location
  ) {}

  ngOnInit() {
    this.staffs$ = this.ws
      .get<StaffDirectory[]>('/staff/listing', { caching: 'cache-only' })
      .pipe(share());
    this.pp.getPosts().subscribe((posts) => (this.posts = posts));
  }

  getCategories() {
    this.pp.getPostCategories().subscribe((cats) => (this.categories = cats));
  }

  post() {
    const newPost: PpPost = {
      user_id: 'mustafa',
      post_id: 8,
      post_content: this.content,
      post_category: this.category.category_name,
      datetime: 'Tue, 24 May 2022 07:05:00 GMT',
      tags: [
        {
          post_id: 8,
          staff_id: 'mustafa',
          tag_id: this.staff.ID,
        },
      ],
    };
    this.pp
      .postPost({ ...this.posts, posts: [newPost, ...this.posts.posts] })
      .subscribe(() => this.location.back());
    // console.log(this.location)
    // this.location.back();
  }

  toggleStaff() {
    this.isStaffOpen = !this.isStaffOpen;
  }

  selectStaff(staff: StaffDirectory) {
    this.staff = staff;
    this.toggleStaff();
    this.getCategories();
  }

  clearStaff() {
    this.staff = null;
    this.toggleStaff();
  }

  toggleCategories() {
    this.isCatsOpen = !this.isCatsOpen;
  }

  selectCategory(cat: PpCategory) {
    this.category = cat;
    this.toggleCategories();
  }

  clearCategory() {
    this.category = null;
    this.toggleCategories();
  }
}
