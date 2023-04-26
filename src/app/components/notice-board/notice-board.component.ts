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
      clickable: true
    },
    autoplay: {
      delay: 8000,
      pauseOnMouseEnter: true,
      disableOnInteraction: false
    },
    speed: 500,
    spaceBetween: 10
  };

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
}
