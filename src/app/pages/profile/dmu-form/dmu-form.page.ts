import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { NEVER, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { DmuFormContent } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-dmu-form',
  templateUrl: './dmu-form.page.html',
  styleUrls: ['./dmu-form.page.scss'],
})
export class DmuFormPage implements OnInit {
  isDmuNeeded$: Observable<any>;
  form$: Observable<DmuFormContent>;
  isAgreed = false;

  devUrl = 'https://dev-api.apiit.edu.my/dmu_form';

  formContent: any;
  checkboxContent: any;

  constructor(
    private ws: WsApiService,
    private router: Router,
    public toastCtrl: ToastController,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.isDmuNeeded$ = this.ws.get<any>('/checkDmuForm', { url: this.devUrl }).pipe(
      tap(res => {
        if (res.status === 'Submitted') {
          this.redirectToProfile();
        }
      })
    );

    this.form$ = this.ws.get<DmuFormContent>('/getDmu', { url: this.devUrl }).pipe(
      tap(res => {
        this.formContent = this.sanitizer.bypassSecurityTrustHtml(res.content);
        this.checkboxContent = res.checkbox_content;
      })
    );
  }

  submitDmuForm() {
    this.ws.post<any>('/registration', { url: this.devUrl }).pipe(
      tap(_ => {
        this.toast('Successfully submitted form', 'success');
        this.redirectToProfile();
      }),
      catchError(err => {
        console.log(err);
        this.toast(err.error.message, 'danger');
        this.redirectToProfile();
        return NEVER;
      })
    ).subscribe(res => {
      console.log(res);
    });
  }

  toast(message: string, color: string) {
    this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color
    }).then(toast => toast.present());
  }

  redirectToProfile() {
    this.router.navigate(['/profile']);
  }
}
