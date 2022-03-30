import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { finalize, Observable } from 'rxjs';

import { AnonymousFeedbackSummary } from '../../interfaces';
import { ComponentService, WsApiService } from '../../services';
import { CreateFeedbackModalPage } from './create-feedback-modal/create-feedback-modal.page';
import { FeedbackDetailsModalPage } from './feedback-details-modal/feedback-details-modal.page';

@Component({
  selector: 'app-anonymous-feedback',
  templateUrl: './anonymous-feedback.page.html',
  styleUrls: ['./anonymous-feedback.page.scss'],
})
export class AnonymousFeedbackPage implements OnInit {

  feedbacks$: Observable<AnonymousFeedbackSummary[]>;
  skeleton = new Array(3);

  constructor(
    private ws: WsApiService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    this.feedbacks$ = this.ws.get<AnonymousFeedbackSummary[]>('/anonymous_feedback/get_all_issues').pipe(
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    )
  }

  openLink(url: string) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return this.component.openLink(url);
    }
    this.navCtrl.navigateForward([url]);
  }

  async createFeedback() {
    const modal = await this.modalCtrl.create({
      component: CreateFeedbackModalPage,
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.completed) {
      this.doRefresh(true);
    }
  }

  async feedbackDetails(feedback: AnonymousFeedbackSummary) {
    if (!feedback.is_anon) {
      const fullUrl = `https://apiit.atlassian.net/servicedesk/customer/portal/12/${feedback.issue_id}`;

      return this.component.openLink(fullUrl);
    }
    // Show Details Modal for Anonymous Feedbacks
    const modal = await this.modalCtrl.create({
      component: FeedbackDetailsModalPage,
      componentProps: {
        feedback
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    await modal.present();
  }
}
