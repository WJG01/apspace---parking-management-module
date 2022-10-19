import { Component, OnInit } from '@angular/core';
import SwiperCore, { Autoplay, Pagination, Swiper } from 'swiper';
import { Observable } from 'rxjs';
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

  constructor(
    private news: NewsService,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.noticeBoardItems$ = this.news.getSlideshow(true, true, false);
  }

  openSlideLink(link: string) {
    this.component.openLink(link);
  }

  setSwiperInstance(swiper: Swiper) {
    let isEnd=false;
    let isDragged=false;
    setInterval(() => {
      if(!isDragged){
        swiper.slideNext()
      }
      if(isEnd){
        swiper.slideToLoop(0)
        isEnd=false;
      }
    }, 3000);

    swiper.on('touchEnd',function(){
      isDragged=false
    })

    swiper.on('sliderFirstMove',function(){
      isDragged=true
    })

    swiper.on('reachEnd', function(){
      isEnd=true;
    });
  }
}
