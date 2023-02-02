import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { map, Observable } from 'rxjs';

import { AnonymousFeedback, AnonymousFeedbackSummary } from '../../../interfaces';
import { ComponentService, WsApiService } from '../../../services';

@Component({
  selector: 'app-feedback-details-modal',
  templateUrl: './feedback-details-modal.page.html',
  styleUrls: ['./feedback-details-modal.page.scss'],
})
export class FeedbackDetailsModalPage implements OnInit {

  @Input() feedback: AnonymousFeedbackSummary;
  details$: Observable<AnonymousFeedback>;
  commentForm: FormGroup;

  constructor(
    private ws: WsApiService,
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.getDetails();

    this.commentForm = this.fb.group({
      comment: ['', [Validators.required]]
    });
  }

  getDetails(): Observable<AnonymousFeedback> {
    return this.details$ = this.ws.get<AnonymousFeedback>(`/anonymous_feedback/get_issue_details_by_ID/${this.feedback.id}`).pipe(
      map(f => f[0])
    );
  }

  async addComment() {
    if (!this.comment.value) {
      return this.component.toastMessage('Comment field cannot be empty.', 'warning');
    }

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.ws.post(`/anonymous_feedback/update_issue_details/${this.feedback.id}`, { body: [{ message: this.comment.value }] }).subscribe({
      next: () => {
        loading.dismiss();
        this.component.toastMessage('Successfully Added Comment!', 'success');
        this.commentForm.reset();
        this.getDetails();
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

  get comment(): AbstractControl {
    return this.commentForm.get('comment');
  }
}
