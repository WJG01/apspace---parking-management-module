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
  category: PpCategory = null;
  content = '';
  isCatsOpen = false;
  profile: StaffDirectory;

  constructor(
    private ws: WsApiService,
    private pp: PeoplepulseService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {
    this.ws.get<StaffDirectory[]>('/staff/profile').subscribe(
      (staff) => this.profile = staff[0],
      (err) => console.log(err),
      () => {
        this.pp.getPostCategories(this.profile.ID, this.post.tagged.id)
          .subscribe((cats) => (this.categories = cats));
        this.content = this.post.content;
        this.category = {
          user_id: 1,
          category_name: this.post.category,
          direct_supervisor: true,
          status: true,
        };
      }
    );
  }

  updatePost() {
    if (this.content === this.post.content && this.category.category_name === this.post.category) {
      return;
    }
    this.pp.editPost(this.profile.ID, this.post.tagged.id, this.post.id, this.category.category_name, this.content).subscribe();
    this.post.content = this.content;
    this.post.category = this.category.category_name;
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
