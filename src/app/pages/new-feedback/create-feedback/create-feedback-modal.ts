import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { FeedbackCategory } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'create-feedback-modal',
  templateUrl: 'create-feedback-modal.html',
  styleUrls: ['create-feedback-modal.scss']
})

export class NewFeedbackModalPage implements OnInit {
  productionAPI = 'https://api.apiit.edu.my/anonymous_feedback';

  phoneNumberValidationPattern = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4,5})$/;
  emailValidationPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  loading: HTMLIonLoadingElement;

  categories$: Observable<FeedbackCategory[]>;

  phoneNumberValid: boolean;
  emailValid: boolean;
  submitting: boolean;
  anon: boolean = false;

  selectedCategory: number;
  message = '';
  attachments = '';

  constructor(
    private modalCtrl: ModalController,
    private ws: WsApiService,
    private loadingController: LoadingController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.categories$ = this.ws.get<FeedbackCategory[]>('/categories', { url: this.productionAPI });
  }


  public onAnonChange(){
    this.anon = true;
    console.log(this.anon);
  }

  submitFeedback() {
    const feedback = {
      message: this.message,
      category_id: this.selectedCategory,
      attachments: this.attachments,
      anon: this.anon
    };
    console.log(feedback);
    this.presentLoading();
    this.submitting = true;

    this.ws.post('/create_issue', { url: this.productionAPI, body: [feedback], timeout: 30000 }).subscribe(_ => {

      this.message = '';
      this.toastCtrl.create({
        // tslint:disable-next-line: max-line-length
        message: '<span style="font-weight: bold;">Feedback submitted! </span> Your feedback has been submitted successfully. The CTI team will get back to you shortly',
        position: 'top',
        color: 'success',
        duration: 5000,
      }).then(toast => toast.present());
      this.submitting = false;
      this.dismissLoading();
      this.modalCtrl.dismiss('SUCCESS');
    }, err => {
      this.toastCtrl.create({
        message: err.message,
        cssClass: 'danger',
        position: 'top',
        duration: 5000,
      }).then(toast => toast.present());
      // finally not invoked as error does not complete
      this.dismissLoading();
      this.submitting = false;
    });
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