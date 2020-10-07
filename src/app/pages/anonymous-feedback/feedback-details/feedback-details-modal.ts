import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AnonymousFeedback, AnonymousFeedbackSummary } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'feedback-details-modal',
  templateUrl: 'feedback-details-modal.html',
  styleUrls: ['feedback-details-modal.scss']
})

export class FeedbackDetailsModalPage implements OnInit {
  productionAPI = 'https://api.apiit.edu.my/anonymous_feedback';

  feedback: AnonymousFeedbackSummary;
  feedbackDetail$: Observable<AnonymousFeedback>;

  loading: HTMLIonLoadingElement;

  comment: string;

  constructor(
    private modalCtrl: ModalController,
    private ws: WsApiService,
    private loadingController: LoadingController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.getFeedbackDetails();
  }

  getFeedbackDetails() {
    this.feedbackDetail$ = this.ws.get<AnonymousFeedback>(`/get_issue_details_by_ID/${this.feedback.id}`, { url: this.productionAPI })
      .pipe(map(feedbacks => feedbacks[0]));

  }

  addComment() {
    this.presentLoading();
    this.ws.post(`/update_issue_details/${this.feedback.id}`, { url: this.productionAPI, body: [{ message: this.comment }] }).subscribe(
      _ => {
        this.toastCtrl.create({
          message: 'Comment Added Successfully!',
          position: 'top',
          color: 'success',
          duration: 5000,
        }).then(toast => toast.present());
        this.comment = '';
        this.dismissLoading();
        this.getFeedbackDetails();
      },
      err => {
        this.toastCtrl.create({
          message: err.message,
          color: 'danger',
          position: 'top',
          duration: 5000,
        }).then(toast => toast.present());
        this.dismissLoading();
      }
    );
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      spinner: 'dots',
      duration: 5000,
      message: 'Please wait...',
      translucent: true,
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    return await this.loading.dismiss();
  }
}
