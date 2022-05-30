import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertButton } from '@ionic/angular';
import { pluck, map } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { Role, StudentProfile, StaffProfile } from '../../../interfaces';
import { ComponentService, WebspacePasswordService, WsApiService } from '../../../services';

@Component({
  selector: 'app-reset-webspace-password',
  templateUrl: './reset-webspace-password.page.html',
  styleUrls: ['./reset-webspace-password.page.scss'],
})
export class ResetWebspacePasswordPage implements OnInit {

  resetWebspaceIDPasswordForm: FormGroup;
  name = '';

  constructor(
    private fb: FormBuilder,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private webspacePassword: WebspacePasswordService,
    private router: Router,
    private storage: Storage,
    private ws: WsApiService
  ) { }

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
      (role & Role.Student
        ? this.ws.get<StudentProfile>('/student/profile', { caching: 'cache-only' }).pipe(pluck('NAME'))
        : this.ws.get<StaffProfile>('/staff/profile', { caching: 'cache-only' }).pipe(map(profile => (profile[0] || {}).FULLNAME))
      ).subscribe({
        next: (name: string) => this.name = name || 'No profile found',
        error: () => this.name = 'No profile found'
      });
    });

    this.resetWebspaceIDPasswordForm = this.fb.group({
      ICOrPassportNumber: ['', [Validators.required]]
    });
  }

  async resetPassword() {
    if (!this.resetWebspaceIDPasswordForm.valid) {
      this.resetWebspaceIDPasswordForm.markAllAsTouched();
      this.component.errorHaptic();
      return;
    }

    const btn: AlertButton = {
      text: 'Continue',
      cssClass: 'danger',
      handler: async () => {
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...',
        });
        await loading.present();

        this.webspacePassword.resetPassword(this.icOrPassport.value).subscribe({
          next: () => {
            loading.dismiss();
            this.component.successHaptic();
            this.component.toastMessage('Your password has been reset. Please check your Email for the new password.', 'success');
            this.router.navigate(['/settings']);
          },
          error: (err) => {
            loading.dismiss();
            this.component.errorHaptic();
            this.component.toastMessage(err.error.error, 'danger');
          },
          complete: () => loading.dismiss()
        });
      }
    }

    this.component.alertMessage('Webspace Password', `After clicking "Continue", your Webspace ID's password will be reset.`, 'Cancel', btn);
  }

  get icOrPassport(): AbstractControl {
    return this.resetWebspaceIDPasswordForm.get('ICOrPassportNumber');
  }
}
