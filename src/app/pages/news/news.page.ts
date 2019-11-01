import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ModalController } from '@ionic/angular';
import { News } from '../../interfaces';
import { NewsService } from '../../services';
import { NewsModalPage } from './news-modal';
@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage {
  news$: Observable<News[]>;

  skeletonSettings = {
    numberOfSkeltons: new Array(5),
  };
  constructor(

    private news: NewsService,
    private modalCtrl: ModalController,
  ) { }


  doRefresh(refresher?) {
    this.news$ = this.news.get(Boolean(refresher)).pipe(
      finalize(() => refresher && refresher.target.complete()),
    );
  }

  ionViewDidEnter() {
    this.doRefresh();
  }
  async openModal(item: News) {
    const modal = await this.modalCtrl.create({
      component: NewsModalPage,
      // TODO: store search history
      componentProps: { item, notFound: 'No news Selected' },
    });
    await modal.present();
    // default item to current intake if model dismissed without data
    await modal.onDidDismiss();
  }
}

