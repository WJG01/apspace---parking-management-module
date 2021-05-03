import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { NewFeedbackSummary } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';
import { FeedbackDetailsModalPage } from './feedback-details/feedback-details-modal';
import { NewFeedbackModalPage } from './create-feedback/create-feedback-modal';

@Component({
  selector: 'app-feedback-list',
  templateUrl: './feedback-list.page.html',
  styleUrls: ['./feedback-list.page.scss'],
})
export class FeedbackListPage implements OnInit {
  // productionAPI = 'https://api.apiit.edu.my/anonymous_feedback';
  productionAPI = 'https://is04zlrnac.execute-api.ap-southeast-1.amazonaws.com/staging/anonymous_feedback'

  loadingArray = new Array(5);
  feedbackList$: Observable<NewFeedbackSummary[]>;
  mobileApp: boolean;
  constructor(
    private ws: WsApiService,
    private plt: Platform,
    private modalCtrl: ModalController
    ) { }

  ngOnInit() {
    this.mobileApp = this.plt.is('cordova');
    this.doRefresh();
  }

  doRefresh(refresher?){
    this.feedbackList$ = this.ws.get<NewFeedbackSummary[]>('/get_all_issues', {url: this.productionAPI}).pipe(
      finalize(() => refresher && refresher.target.complete())
    );
  }

  async createNewFeedback() {
    const modal = await this.modalCtrl.create({
      component: NewFeedbackModalPage,
      cssClass: 'custom-modal-style'
    });
    await modal.present();
    await modal.onDidDismiss().then(data => {
      if (data.data === 'SUCCESS') {
        this.doRefresh();
      }
    });
  }

  async viewFeedbackDetails(feedback: NewFeedbackSummary) {
    const modal = await this.modalCtrl.create({
      component: FeedbackDetailsModalPage,
      cssClass: 'custom-modal-style',
      componentProps: {feedback}
    });
    await modal.present();
    await modal.onDidDismiss().then(data => {
      if (data.data === 'SUCCESS') {
        this.doRefresh();
      }
    });
  }

}
