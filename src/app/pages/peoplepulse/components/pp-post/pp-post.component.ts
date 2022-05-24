import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PeoplepulseService } from '../../services';
import { PpDeleteModalComponent } from '../pp-delete-modal/pp-delete-modal.component';
import { PpEditModalComponent } from '../pp-edit-modal/pp-edit-modal.component';

@Component({
  selector: 'app-pp-post',
  templateUrl: './pp-post.component.html',
  styleUrls: ['./pp-post.component.scss'],
})
export class PpPostComponent implements OnInit {
  @Input() post: any;
  @Input() editable = false;
  color = 'primary';
  lookup = {
    Praise: 'primary',
    Welfare: 'secondary',
    'Issue Escalation': 'tertiary',
    Achievement: 'success',
    'Help Request': 'warning',
    Announcement: 'danger',
  };
  formattedDate = '';

  constructor(private modalController: ModalController, private pp: PeoplepulseService) {}

  ngOnInit() {
    this.color = this.lookup[this.post.category];
    this.formattedDate = this.timeSince(new Date(this.post.datetime));
    // this.post.poster.name = this.titleCase(this.cleanup(this.post.poster.name))
    // this.post.tagged.name = this.titleCase(this.cleanup(this.post.tagged.name))
  }

  async presentDeleteModal() {
    const modal = await this.modalController.create({
      component: PpDeleteModalComponent,
      cssClass: 'delete-modal',
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data.toDelete) {
      this.pp.getPosts().subscribe((p) => {
        p.posts = p.posts.filter((post) => post.post_id !== this.post.id);
        this.pp.deletePost(p).subscribe(() => window.location.reload());
      });
    }
  }

  async presentEditModal() {
    const modal = await this.modalController.create({
      component: PpEditModalComponent,
      componentProps: {
        post: this.post,
      },
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data.updated) { this.color = this.lookup[this.post.category]; }
  }

  cleanup(str: string) {
    return str.replace('.', '. ').replace('\'', '');
  }

  // for some reason all names in apu is caps
  // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
  titleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
  timeSince(date: Date) {
    // use valueOf bcuz typescript doesn't like it without
    const seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
      const i = Math.floor(interval);
      return i + (i === 1 ? ' year' : ' years');
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      const i = Math.floor(interval);
      return i + (i === 1 ? ' month' : ' months');
    }
    interval = seconds / 86400;
    if (interval > 1) {
      const i = Math.floor(interval);
      return i + (i === 1 ? ' day' : ' days');
    }
    interval = seconds / 3600;
    if (interval > 1) {
      const i = Math.floor(interval);
      return i + (i === 1 ? ' hour' : ' hours');
    }
    interval = seconds / 60;
    if (interval > 1) {
      const i = Math.floor(interval);
      return i + (i === 1 ? ' minute' : ' minutes');
    }
    return Math.floor(seconds) + ' seconds';
  }
}
