import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertButton, LoadingController } from '@ionic/angular';
import { tap } from 'rxjs';

import { Storage } from '@ionic/storage-angular';

import { Role } from '../../../interfaces';
import { CasTicketService, ComponentService, WsApiService } from '../../../services';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

  changePasswordForm: FormGroup;
  isStudent = false;
  username: string;
  apiUrl = 'https://rk0bjjav54.execute-api.ap-southeast-1.amazonaws.com/dev';
  // Validations Variables
  hasUpperCase = false;
  passwordLengthMatch = false;
  hasLowerCase = false;
  hasDigit = false;
  hasSpeacialCharacter = false;

  constructor(
    private fb: FormBuilder,
    private storage: Storage,
    private ws: WsApiService,
    private loadingCtrl: LoadingController,
    private cas: CasTicketService,
    private component: ComponentService,
    private router: Router
  ) { }

  ngOnInit() {
    this.storage.get('role').then((role: Role) => {
      this.isStudent = Boolean(role & Role.Student);
      // isStudent might still be false if getUsername function is not inside here
      this.getUsername();
    });


    this.changePasswordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
      confirm_password: ['', Validators.required]
    });

    this.changePasswordForm.valueChanges.subscribe(val => {
      const newPassword = val.new_password;
      const upperCaseRegExp = /^(?=.*[A-Z])/;
      const lowerCaseRegExp = /^(?=.*[a-z])/;
      const digitRegExp = /^(?=.*\d)/;
      const specialCharacterRegExp = /(?=.*?[#?!@$%~()_{}-])/;

      this.hasUpperCase = upperCaseRegExp.test(newPassword);
      this.passwordLengthMatch = newPassword.length > 8;
      this.hasLowerCase = lowerCaseRegExp.test(newPassword);
      this.hasDigit = digitRegExp.test(newPassword);
      this.hasSpeacialCharacter = specialCharacterRegExp.test(newPassword);
    });
  }

  getUsername() {
    const endpoint = this.isStudent ? '/student/profile' : '/staff/profile';

    this.ws.get(endpoint, { caching: 'cache-only' }).pipe(
      tap(user => this.username = this.isStudent ? user['STUDENT_NUMBER'] : user[0]['ID'])
    ).subscribe();
  }

  async changePassword() {
    if (!this.changePasswordForm.valid) {
      this.changePasswordForm.markAllAsTouched();
      this.component.errorHaptic();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });
    await loading.present();

    this.cas.getTGT(this.username, this.currentPassword.value).subscribe({
      next: () => {
        loading.dismiss();
        this.confirmReset();
      },
      error: () => {
        // tgt is invalid => current password is incorrect
        loading.dismiss();
        this.component.toastMessage('The current password you have entered is incorrect', 'danger');
        this.component.errorHaptic();
      }
    });
  }

  confirmReset() {
    const btn: AlertButton = {
      text: 'Continue',
      cssClass: 'danger',
      handler: async () => {
        const endpoint = this.isStudent ? '/student' : '/user';
        const { current_password, ...body } = this.changePasswordForm.value;

        const loading = await this.loadingCtrl.create({
          message: 'Please wait...',
        });
        await loading.present();

        this.ws.post(endpoint, { body, url: this.apiUrl }).subscribe({
          next: () => {
            this.component.toastMessage('Your passowrd has been changed. Please log in again', 'success');
            this.component.successHaptic();
            this.router.navigate(['/logout']);
            loading.dismiss();
          },
          error: () => {
            loading.dismiss();
            this.component.toastMessage('Something went wrong from our side. Please try again or contact us via the feedback page', 'danger');
          }
        });
      }
    }

    this.component.alertMessage('Reset Password', 'You are about to update your APKey Password. After clicking "Continue", you will be automatically logged out from the application for security reasons. Therefore, we advise you to log out and log in again to all other applications that require APKey authentication', 'Cancel', btn);
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
