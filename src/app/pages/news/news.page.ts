import { Component, ViewChild } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ShortNews } from '../../interfaces';
import { NewsService } from '../../services';
import { NewsModalPage } from './news-modal';


@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage {
  @ViewChild('slides') slides: IonSlides;
  news$: Observable<ShortNews[]>;
  noticeBoardItems$: Observable<any[]>;
  noticeBoardSliderOpts = {
    autoplay: true,
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.params = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const { slides } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          let tx = -offset$$1;
          if (!swiper.params.virtualTranslate) { tx -= swiper.translate; }
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, $wrapperEl } = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) { return; }
            if (!swiper || swiper.destroyed) { return; }
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: (_, className) => {
        return '<span style="width: 10px; height: 10px; background-color: #E50565 !important;" class="' + className + '"></span>';
      }
    }
  };

  skeletonSettings = {
    numberOfSkeltons: new Array(5),
  };
  constructor(
    private news: NewsService,
    private modalCtrl: ModalController,
  ) { }


  doRefresh(refresher?) {
    this.news$ = this.news.get(Boolean(refresher)).pipe(
      map(newsList => {
        return newsList.map(item => {
          if (item && item.field_news_image.length > 0 && item.field_news_image[0].url) {
            return {
              url: item.field_news_image[0].url,
              title: item.title.length > 0 && item.title[0].value ? item.title[0].value : '',
              updated: item.changed.length > 0 && item.changed[0].value ? new Date(item.changed[0].value * 1000) : '',
              body: item.body.length > 0 && item.body[0].value ? item.body[0].value : ''
            };
          }
        });
      }),
      finalize(() => refresher && refresher.target.complete())
    );
    this.noticeBoardItems$ = this.news.getSlideshow(refresher);
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

  prevSlide() {
    this.slides.slidePrev();
  }

  nextSlide() {
    this.slides.slideNext();
  }
}

