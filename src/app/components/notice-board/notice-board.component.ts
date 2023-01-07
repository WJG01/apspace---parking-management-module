import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import SwiperCore, { Autoplay, Pagination, Swiper, SwiperOptions } from 'swiper';

import { News } from '../../interfaces/news';
import { NewsService } from '../../services/news.service';
import { ComponentService } from '../../services';

// install Swiper modules
SwiperCore.use([Autoplay, Pagination]);

@Component({
  selector: 'app-notice-board',
  templateUrl: './notice-board.component.html',
  styleUrls: ['./notice-board.component.scss'],
})
export class NoticeBoardComponent implements OnInit {

  noticeBoardItems$: Observable<News[]>;
  swiperConfig: SwiperOptions = {
    pagination: {
      dynamicBullets: true
    },
    spaceBetween: 10
  }

  constructor(
    private news: NewsService,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.noticeBoardItems$ = this.news.getSlideshow(true, true, false);
  }

  openSlideLink(news: News) {
    if (news['post-meta-fields']['slideshow_url'] && news['post-meta-fields']['slideshow_url'][0]) {
      this.component.openLink(news['post-meta-fields']['slideshow_url'][0]);
    } else {
      this.component.openLink(news.link);
    }
  }

  setSwiperInstance(swiper: Swiper) {
    let isEnd = false;
    let isDragged = false;

    setInterval(() => {
      if (!isDragged) {
        swiper.slideNext(500);
      }
      if (isEnd) {
        swiper.slideToLoop(0);
        isEnd = false;
      }
    }, 3000);

    swiper.on('touchEnd', function () {
      isDragged = false;
    })

    swiper.on('sliderFirstMove', function () {
      isDragged = true;
    })

    swiper.on('reachEnd', function () {
      isEnd = true;
    });
  }
}
