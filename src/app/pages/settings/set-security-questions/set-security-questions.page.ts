import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertButton } from '@ionic/angular';
import { Observable, tap } from 'rxjs';

import { SecurityQuestionsAndAnswers } from '../../../interfaces';
import { ComponentService, WsApiService } from '../../../services';

@Component({
  selector: 'app-set-security-questions',
  templateUrl: './set-security-questions.page.html',
  styleUrls: ['./set-security-questions.page.scss'],
})
export class SetSecurityQuestionsPage implements OnInit {

  securityQuestionForm: FormGroup;
  securityQuestions$: Observable<SecurityQuestionsAndAnswers>;
  skeleton = new Array(5);

  constructor(
    private fb: FormBuilder,
    private ws: WsApiService,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.securityQuestions$ = this.ws.get<SecurityQuestionsAndAnswers>('/sqa/').pipe(
      tap(q => {
        this.securityQuestionForm = this.fb.group({
          attributeAnswer1: ['', [Validators.required]],
          attributeAnswer2: ['', [Validators.required]],
          attributeQuestion1: ['', [Validators.required]],
          attributeQuestion2: ['', [Validators.required]],
          secondaryEmail: ['', [Validators.required, Validators.email]],
        });

        this.securityQuestionForm.patchValue({
          attributeAnswer1: q.attributeAnswer1,
          attributeAnswer2: q.attributeAnswer2,
          attributeQuestion1: q.attributeQuestion1,
          attributeQuestion2: q.attributeQuestion2,
          secondaryEmail: q.secondaryEmail,
        });
      })
    );
  }

  submit() {
    if (!this.securityQuestionForm.valid) {
      this.securityQuestionForm.markAllAsTouched();
      return;
    }

    const btn: AlertButton = {
      text: 'Yes',
      cssClass: 'danger',
      handler: () => {
        const body = new HttpParams({ fromObject: { ...this.securityQuestionForm.value } }).toString();
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

        this.ws.post('/sqa/', { body, headers }).subscribe({
          next: () => {
            this.component.toastMessage('Your security question and secondary email have been updated successfully.', 'success');
            this.component.successHaptic();
          },
          error: () => {
            this.component.toastMessage('Something went wrong and we couldn not complete your request. Please try again or contact us via the feedback page.', 'danger');
            this.component.errorHaptic();
          }
        });
      }
    }

    this.component.alertMessage('Update Security Questions', 'You are about to update your security questions and your secondary email which are used to recover your password in case you forget it. Do you want to continue?', 'Cancel', btn);
  }

  get q1(): AbstractControl {
    return this.securityQuestionForm.get('attributeQuestion1');
  }

  get a1(): AbstractControl {
    return this.securityQuestionForm.get('attributeAnswer1');
  }

  get q2(): AbstractControl {
    return this.securityQuestionForm.get('attributeQuestion2');
  }

  get a2(): AbstractControl {
    return this.securityQuestionForm.get('attributeAnswer2');
  }

  get email(): AbstractControl {
    return this.securityQuestionForm.get('secondaryEmail');
  }
}
