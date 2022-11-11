import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { finalize, map, Observable } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { ShortNews } from '../../interfaces/news';
import { Role } from '../../interfaces';
import { NewsService } from '../../services/news.service';
import { NewsDetailsModalPage } from './news-details-modal/news-details-modal.page';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {

  news$: Observable<ShortNews[]>;
  skeletons = new Array(6);
  role: Role;
  isStudent: boolean;
  isStaff: boolean;

  constructor(
    private news: NewsService,
    private modalCtrl: ModalController,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
      this.role = role;
      // tslint:disable-next-line: no-bitwise
      this.isStudent = Boolean(role & Role.Student);
      // tslint:disable-next-line: no-bitwise
      this.isStaff = Boolean((role & Role.Lecturer) || (role & Role.Admin));
    });
  }

  ionViewDidEnter() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    this.news$ = this.news.get(refresher, this.isStudent, this.isStaff).pipe(
      map(newsList => {
        return newsList.map(item => {
          if (item && item.featured_image_src.length > 0) {
            return {
              url: item.featured_image_src,
              title: item.title && item.title.rendered ? item.title.rendered : '',
              updated: item.modified ? new Date(item.modified) : '',
              body: item.content && item.content.rendered ? item.content.rendered : ''
            };
          }
        });
      }),
      finalize(() => refresher && refresher.target.complete())
    );
  }

  async newsDetails(newsItem: ShortNews) {
    const modal = await this.modalCtrl.create({
      component: NewsDetailsModalPage,
      componentProps: {
        newsItem
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    modal.present();
  }
}
