import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { FeedbackCategory } from '../../../interfaces';
import { ComponentService, WsApiService } from '../../../services';

@Component({
  selector: 'app-create-feedback-modal',
  templateUrl: './create-feedback-modal.page.html',
  styleUrls: ['./create-feedback-modal.page.scss'],
})
export class CreateFeedbackModalPage implements OnInit {

  categories$: Observable<FeedbackCategory[]>;
  feedbackForm: FormGroup;

  constructor(
    private ws: WsApiService,
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private component: ComponentService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.categories$ = this.ws.get<FeedbackCategory[]>('/anonymous_feedback/categories');

    this.feedbackForm = this.fb.group({
      category: ['', [Validators.required]],
      anonymous: [false, [Validators.required]],
      message: ['', Validators.required]
    });
  }

  async submit() {
    const message = this.feedbackForm.get('message').value;
    const category = this.feedbackForm.get('category').value;

    if (!message || !category) {
      return this.component.toastMessage('Please ensure all required fields are not empty!', 'warning');
    }

    const feedback = {
      message,
      category_id: category,
      anon: this.feedbackForm.get('anonymous').value,
      attachments: ''
    }

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.ws.post('/anonymous_feedback/create_issue', { body: [feedback], timeout: 30000 }).subscribe({
      next: () => {
        loading.dismiss();
        this.component.toastMessage('Your feedback has been submitted successfully. The respective team will get back to you shortly!', 'success');
        this.modalCtrl.dismiss({ completed: true });
      },
      error: (err) => {
        loading.dismiss();
        this.component.toastMessage(err.message, 'danger');
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
