import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { PpCategory, StaffDirectory } from 'src/app/interfaces';
import { PeoplepulseService, WsApiService } from 'src/app/services';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements OnInit {
  staffs: StaffDirectory[];
  staff: StaffDirectory = null;
  categories: PpCategory[] = [];
  category: PpCategory = null;
  lookup = {
    Praise: 'primary',
    Welfare: 'secondary',
    'Issue Escalation': 'tertiary',
    Achievement: 'success',
    'Help Request': 'warning',
    Announcement: 'danger',
  };
  content = '';
  isStaffOpen = false;
  isCatsOpen = false;
  profile: StaffDirectory;

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private location: Location,
  ) { }

  ngOnInit() {
    this.ws.get<StaffDirectory[]>('/staff/listing', { caching: 'cache-only' })
      .subscribe((staffs) => this.staffs = staffs);
    this.ws.get<StaffDirectory[]>('/staff/profile')
      .subscribe((staff) => this.profile = staff[0]);
  }

  getCategories() {
    this.pp.getPostCategories(this.profile.ID, this.staff.ID).subscribe((cats) => (this.categories = cats));
  }

  post() {
    this.pp
      .postPost(this.profile.ID, this.staff.ID, this.category.id, this.content)
      .subscribe(() => location.href = '/peoplepulse');
  }

  toggleStaff() {
    this.isStaffOpen = !this.isStaffOpen;
  }

  goBack() {
    this.location.back();
  }

  selectStaff($event) {
    const staffId = $event;
    this.staff = this.staffs.filter((staff) => staff.ID === staffId)[0];
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
