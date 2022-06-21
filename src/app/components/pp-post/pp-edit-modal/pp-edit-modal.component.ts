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
        this.content = this.post.content;
        this.pp.getPostCategories(this.profile.ID, this.post.tagged.id).subscribe(
          (cats) => (this.categories = cats),
          (err) => console.log(err),
          () => {
            this.category = {
              id: this.categories.filter((c) => c.category === this.post.category)[0].id,
              category: this.post.category,
              direct_supervisor: this.categories.filter((c) => c.category === this.post.category)[0].direct_supervisor,
              status: this.categories.filter((c) => c.category === this.post.category)[0].status,
            };
          }
        );
      }
    );
  }

  updatePost() {
    if (this.content === this.post.content && this.category.category === this.post.category) {
      return;
    }
    this.pp.editPost(this.profile.ID, this.post.tagged.id, this.post.id, this.category.id, this.content).subscribe();
    this.post.content = this.content;
    this.post.category = this.category.category;
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
