import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { News, Role, ShortNews } from '../../interfaces';
import { NewsService } from '../../services';
import { NewsModalPage } from './news-modal';


@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  @ViewChild('slides') slides: IonSlides;
  news$: Observable<ShortNews[]>;
  noticeBoardItems$: Observable<News[]>;

  role: Role;
  isStudent: boolean;
  isLecturer: boolean;

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
    private storage: Storage
  ) { }

  doRefresh(refresher?) {

    this.news$ = this.news.get(Boolean(refresher), this.isStudent, this.isLecturer).pipe(
      map(newsList => {
        return newsList.map(item => {
          if (item && item.featured_media_source.length > 0 && item.featured_media_source[0].source_url) {
            return {
              url: item.featured_media_source[0].source_url,
              title: item.title && item.title.rendered ? item.title.rendered : '',
              updated: item.modified ? new Date(item.modified) : '',
              body: item.content && item.content.rendered ? item.content.rendered : ''
            };
          }
        });
      }),
      finalize(() => refresher && refresher.target.complete())
    );

    this.noticeBoardItems$ = this.news.getSlideshow(refresher, this.isStudent, this.isLecturer);
  }

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
        this.role = role;
        // tslint:disable-next-line: no-bitwise
        this.isStudent = Boolean(role & Role.Student);
        // tslint:disable-next-line: no-bitwise
        this.isLecturer = Boolean(role & (Role.Lecturer || Role.Admin));
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

  prevSlide() {
    this.slides.slidePrev();
  }

  nextSlide() {
    this.slides.slideNext();
  }
}

