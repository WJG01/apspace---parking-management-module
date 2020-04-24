import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform, ToastController } from '@ionic/angular';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FeedbackService, VersionService } from '../../services';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  phoneNumberValidationPattern = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4,5})$/;
  phoneNumberValid = false;

  onlineFeedbackSystemURL = 'https://erp.apiit.edu.my/easymoo/web/en/user/feedback/feedbackusersend';

  contactNo = '';
  message = '';
  platform: string;
  appVersion: string;

  submitting = false;
  readonly screenSize = screen.width + 'x' + screen.height;
  loading: HTMLIonLoadingElement;

  constructor(
    private feedback: FeedbackService,
    private plt: Platform,
    private toastCtrl: ToastController,
    private version: VersionService,
    private iab: InAppBrowser,
    private loadingController: LoadingController
  ) { }

  submitFeedback() {
    const feedback = {
      contactNo: this.contactNo || '',
      platform: this.platform,
      message: this.message,
      mobile: this.plt.is('cordova') ? 'Yes' : 'No',
      appVersion: this.appVersion,
      screenSize: this.screenSize,
    };
    this.presentLoading();
    this.submitting = true;
    this.feedback.sendFeedback(feedback).subscribe(_ => {
      this.message = '';
      this.toastCtrl.create({
        // tslint:disable-next-line: max-line-length
        message: '<span style="font-weight: bold;">Feedback submitted! </span> The team will get back to you as soon as possible via Email. Thank you for your feedback',
        position: 'top',
        color: 'success',
        duration: 5000,
        showCloseButton: true,
      }).then(toast => toast.present());
      this.submitting = false;
      this.dismissLoading();
    }, err => {
      this.toastCtrl.create({
        message: err.message,
        cssClass: 'danger',
        position: 'top',
        duration: 5000,
        showCloseButton: true,
      }).then(toast => toast.present());
      // finally not invoked as error does not complete
      this.dismissLoading();
      this.submitting = false;
    });
  }

  ngOnInit() {
    this.platform = this.feedback.platform();
    this.appVersion = this.version.name;
  }

  onMessageFieldChange(event) {
    this.message = event.trim();
  }

  onPhoneNumberChange() {
    this.phoneNumberValid = this.contactNo.match(this.phoneNumberValidationPattern) !== null;
  }

  openOnlineFeedbackSystem() {
    this.iab.create(this.onlineFeedbackSystemURL, '_system', 'location=true');
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
