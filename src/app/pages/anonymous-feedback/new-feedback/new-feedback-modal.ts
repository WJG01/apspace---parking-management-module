import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { FeedbackCategory } from 'src/app/interfaces';
import { VersionService, WsApiService } from 'src/app/services';

@Component({
  selector: 'new-feedback-modal',
  templateUrl: 'new-feedback-modal.html',
  styleUrls: ['new-feedback-modal.scss']
})

export class NewFeedbackModalPage implements OnInit {
  onlineFeedbackSystemURL = 'https://erp.apiit.edu.my/easymoo/web/en/user/feedback/feedbackusersend';
  // stagingAPI = 'https://is04zlrnac.execute-api.ap-southeast-1.amazonaws.com/staging/anonymous_feedback';
  productionAPI = 'https://api.apiit.edu.my/anonymous_feedback';

  phoneNumberValidationPattern = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4,5})$/;
  emailValidationPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  loading: HTMLIonLoadingElement;

  categories$: Observable<FeedbackCategory[]>;

  phoneNumberValid: boolean;
  emailValid: boolean;
  submitting: boolean;

  selectedCategory: number;
  subject = '';
  message = '';
  contactNo = '';
  emailAddress = '';
  version = '';
  platform = '';
  attachments = '';

  constructor(
    private modalCtrl: ModalController,
    private ws: WsApiService,
    private loadingController: LoadingController,
    private toastCtrl: ToastController,
    private versionService: VersionService,
  ) { }

  ngOnInit() {
    this.categories$ = this.ws.get<FeedbackCategory[]>('/categories', { url: this.productionAPI });
    // this.categories$ = this.ws.get<FeedbackCategory[]>('/categories', { url: this.localhost });
    this.version = this.versionService.version;
    this.platform = this.versionService.platform;
  }

  onPhoneNumberChange() {
    this.phoneNumberValid = this.contactNo.match(this.phoneNumberValidationPattern) !== null;
  }

  onEmailFieldChange() {
    this.emailValid = this.emailAddress.match(this.emailValidationPattern) !== null;
  }

  submitFeedback() {
    const feedback = {
      platform: this.platform,
      message: this.message,
      category_id: this.selectedCategory,
      subject: this.subject,
      attachments: this.attachments,
      contact_number: this.contactNo,
      email_address: this.emailAddress,
      version: this.version
    };
    this.presentLoading();
    this.submitting = true;

    this.ws.post('/create_issue', { url: this.productionAPI, body: [feedback], timeout: 30000 }).subscribe(_ => {

      this.message = '';
      this.toastCtrl.create({
        // tslint:disable-next-line: max-line-length
        message: '<span style="font-weight: bold;">Anonymous Feedback submitted! </span> Your feedback has been submitted without sharing your identity',
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
