import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertButton, LoadingController } from '@ionic/angular';

import { PasswordValidator } from '../../../validators/password.validator';
import { ComponentService, WebspacePasswordService } from '../../../services';

@Component({
  selector: 'app-change-webspace-password',
  templateUrl: './change-webspace-password.page.html',
  styleUrls: ['./change-webspace-password.page.scss'],
})
export class ChangeWebspacePasswordPage implements OnInit {

  changePasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private webspacePassword: WebspacePasswordService,
    private router: Router
  ) { }

  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
      confirm_password: ['', Validators.required]
    }, { validators: PasswordValidator });
  }

  async changePassword() {
    if (!this.changePasswordForm.valid) {
      this.changePasswordForm.markAllAsTouched();
      this.component.errorHaptic();
      return;
    }

    const btn: AlertButton = {
      text: 'Continue',
      cssClass: 'danger',
      handler: async () => {
        const changePassword = {
          current: this.currentPassword.value,
          new: this.newPassword.value
        };
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...',
        });
        await loading.present();

        this.webspacePassword.changePassword(changePassword).subscribe({
          next: () => {
            loading.dismiss();
            this.component.successHaptic();
            this.component.toastMessage('Your Webspace password has been changed.', 'success');
            this.router.navigate(['/settings']);
          },
          error: (err) => {
            loading.dismiss();
            this.component.errorHaptic();
            this.component.toastMessage(err.error.msg.replace('Error: ', '') + ' Please try again or contact us via the feedback page', 'danger');
          },
          complete: () => {
            loading.dismiss();
          }
        });
      }
    }

    this.component.alertMessage('Webspace Password', 'After clicking "Continue", your Webspace password will be changed with the new password.', 'Cancel', btn);
  }

  get currentPassword(): AbstractControl {
    return this.changePasswordForm.get('current_password');
  }

  get newPassword(): AbstractControl {
    return this.changePasswordForm.get('new_password');
  }

  get confirmPassword(): AbstractControl {
    return this.changePasswordForm.get('confirm_password');
  }
}
