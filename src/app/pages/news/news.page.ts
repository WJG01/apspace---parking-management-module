import { Component, OnInit } from '@angular/core';
import { ShortNews } from '../../interfaces/news';
import { finalize, map, Observable } from 'rxjs';
import { Role } from '../../interfaces';
import { ModalController } from '@ionic/angular';
import { NewsService } from '../../services/news.service';
import { NewsModalPage } from './news-modal';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  news$: Observable<ShortNews[]>;
  role: Role;
  isStudent: boolean;
  isLecturer: boolean;

  skeletonSettings = {
    numberOfSkeltons: new Array(6),
  };

  constructor(
    private news: NewsService,
    private modalCtrl: ModalController,
    private storage: Storage
  ) { }

  doRefresh(refresher?) {
    this.news$ = this.news.get(refresher, this.isStudent, this.isLecturer).pipe(
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

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
        this.role = role;
        // tslint:disable-next-line: no-bitwise
        this.isStudent = Boolean(role & Role.Student);
        // tslint:disable-next-line: no-bitwise
        this.isLecturer = Boolean((role & Role.Lecturer) || (role & Role.Admin));
      }
    );
  }

  ionViewDidEnter() {
    this.doRefresh();
  }

  async openModal(newsItem: ShortNews) {
    const modal = await this.modalCtrl.create({
      component: NewsModalPage,
      componentProps: { newsItem },
    });
    await modal.present();
    await modal.onDidDismiss();
  }

}
