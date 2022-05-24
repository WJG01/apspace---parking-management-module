import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PpCategory } from 'src/app/interfaces';
import { PeoplepulseService } from '../../services';

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

  constructor(private pp: PeoplepulseService, private modalController: ModalController) {}

  ngOnInit() {
    this.pp.getPostCategories().subscribe((cats) => (this.categories = cats));
    this.content = this.post.content;
    this.category = {
      user_id: 1,
      category_name: this.post.category,
      direct_supervisor: true,
      status: true,
    };
  }

  updatePost() {
    if (this.content === this.post.content && this.category.category_name === this.post.category) {
      return;
    }
    this.pp.getPosts().subscribe((p) => {
      p.posts = p.posts.map((post) => {
        if (post.post_id === this.post.id) {
          post.post_content = this.content;
          post.post_category = this.category.category_name;
        }
        return post;
      });
      this.pp.editPost(p).subscribe();
    });
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
