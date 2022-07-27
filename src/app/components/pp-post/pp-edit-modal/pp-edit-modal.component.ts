import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PpCategory, StaffDirectory } from 'src/app/interfaces';
import { PeoplepulseService, WsApiService } from 'src/app/services';

@Component({
  selector: 'app-pp-edit-modal',
  templateUrl: './pp-edit-modal.component.html',
  styleUrls: ['./pp-edit-modal.component.scss'],
})
export class PpEditModalComponent implements OnInit {
  @Input() post: any;
  categories: PpCategory[] = [];
  category: PpCategory;
  content = '';
  isCatsOpen = false;
  profile: StaffDirectory;
  lookup = {
    Praise: 'primary',
    Welfare: 'secondary',
    'Issue Escalation': 'tertiary',
    Achievement: 'success',
    'Help Request': 'warning',
    Announcement: 'danger',
  };

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {
    this.category = this.post.category;
    this.content = this.post.content;

    this.ws.get<StaffDirectory[]>('/staff/profile').subscribe(
      (staff) => this.profile = staff[0],
      (err) => console.log(err),
      () => {
        this.pp.getPostCategories(this.profile.ID, this.post.tagged.id).subscribe(
          (cats) => (this.categories = cats),
          (err) => console.log(err),
        );
      }
    );
  }

  updatePost() {
    if (this.content === this.post.content &&
        this.category.category === this.post.category) {
      return;
    }
    this.pp.editPost(this.profile.ID, this.post.tagged.id, this.post.id, this.category.id, this.content).subscribe();
    this.post.content = this.content;
    this.post.category = this.category;
  }

  onCancelClick() {
    this.modalController.dismiss({ updated: false });
  }

  onUpdateClick() {
    this.updatePost();
    this.modalController.dismiss({ updated: true });
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
