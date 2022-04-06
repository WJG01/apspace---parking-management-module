import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';

import { Device } from '@capacitor/device';

import { ComponentService, ConfigurationsService, WsApiService } from '../../services';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {

  feedbackForm: FormGroup;
  readonly screenSize = screen.width + 'x' + screen.height;

  constructor(
    private component: ComponentService,
    private fb: FormBuilder,
    private plt: Platform,
    private config: ConfigurationsService,
    private ws: WsApiService,
    private loadingCtrl: LoadingController
  ) {
  }

  ngOnInit() {
    this.feedbackForm = this.fb.group({
      contactNo: ['', [Validators.pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4,5})$/)]],
      message: ['', [Validators.required]]
    });
  }

  async submit() {
    if (!this.feedbackForm.get('message').value) {
      return this.component.toastMessage('Please describe your Feedback!', 'warning');
    }

    if ((this.contact.dirty || this.contact.touched) && this.contact.errors?.pattern?.requiredPattern) {
      return this.component.toastMessage('Please enter a valid contact number!', 'warning');
    }

    const formValue = this.feedbackForm.value;
    const deviceInfo = await Device.getInfo();
    const userAgent = navigator.userAgent;
    const platform = `${deviceInfo.platform} ${deviceInfo.operatingSystem} ${deviceInfo.osVersion} ${userAgent}`;
    const mobile = this.plt.is('capacitor') ? 'Yes' : 'No';

    const body = {
      ...formValue,
      platform,
      mobile,
      appVersion: this.config.appVersion,
      screenSize: this.screenSize
    };

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.ws.post('/apspacefeedback/submit', { body, timeout: 30000 }).subscribe({
      next: () => {
        this.component.toastMessage('Feedback submitted! The team will get back to you as soon as possible via Email. Thank you for your feedback.', 'success');
        loading.dismiss();
        this.feedbackForm.reset();
      },
      error: (err) => {
        loading.dismiss();
        this.component.toastMessage(`Error: ${err.message}`, 'danger');
      }
    });
  }

  openOnlineFeedbackSystem() {
    this.component.openLink('https://erp.apiit.edu.my/easymoo/web/en/user/feedback/feedbackusersend');
  }

  get contact(): AbstractControl {
    return this.feedbackForm.get('contactNo');
  }
}
