import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertButton, LoadingController } from '@ionic/angular';
import { catchError, throwError, switchMap, timeout } from 'rxjs';

import { CasTicketService, ComponentService } from '../../services';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cas: CasTicketService,
    private component: ComponentService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      apkey: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  async login() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 5000
    });
    await loading.present();

    this.cas.getTGT(this.apkey.value, this.password.value).pipe(
      catchError(async (err) => {
        await loading.dismiss();
        // the error format may changed anytime, should be checked as string
        const errMessage = JSON.stringify(err);

        if (errMessage.includes('AccountPasswordMustChangeException')) {
          const btn: AlertButton = {
            text: 'Documentation',
            handler: () => {
              console.log('Open Documentation');
            }
          };
          this.component.alertMessage('Login Failed!', 'Your password has expired. You are required to change your password to be able to login to the APSpace and other applications. You can follow the steps on our documentation to reset your password.', '', btn);

          return throwError(() => new Error('Your password has expired!'));
        } else {
          this.component.toastMessage('Invalid APKey or Password', 'danger');

          return throwError(() => new Error('Invalid APKey or Password'));
        }
      }),
      switchMap(tgt => this.cas.getST(this.cas.casUrl, tgt).pipe(
        catchError(() => (this.component.toastMessage('Fail to get service ticket.', 'danger'), throwError(() => new Error('Fail to get service ticket'))))
      )),
      switchMap(st => this.cas.validate(st).pipe(
        catchError(() => (this.component.toastMessage('You are not authorized to use APSpace', 'danger'), throwError(() => new Error('unauthorized'))))
      )),
      timeout(15000)
    ).subscribe({
      next: async () => {
        await loading.dismiss();

        const url = this.route.snapshot.queryParams.redirect || '/';
        this.router.navigateByUrl(url, { replaceUrl: true });
      }
    });
  }

  get apkey(): AbstractControl {
    return this.loginForm.get('apkey');
  }

  get password(): AbstractControl {
    return this.loginForm.get('password');
  }
}
