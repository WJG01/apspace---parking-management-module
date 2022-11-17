import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ComponentService, WsApiService } from 'src/app/services';
import { StudentDetailsModalPage } from './student-details-modal';

@Component({
  selector: 'app-igraduate',
  templateUrl: './igraduate.page.html',
  styleUrls: ['./igraduate.page.scss'],
})
export class IgraduatePage implements OnInit {
  loading: HTMLIonLoadingElement;
  idToSearch = '';
  selectedSegment: 'studentsList' | 'exceptions' = 'studentsList';
  studentIDException = '';
  studentsList$: Observable<any>;
  exceptionsList$: Observable<any>;
  userUnauthorized = false;
  constructor(
    private ws: WsApiService,
    private component: ComponentService,
    private modalCtrl: ModalController,
    private loadingController: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh() {
    this.studentsList$ = this.ws.get<any>('/igraduate/student_list').pipe(
      catchError(err => {
        if (err.status === 401) {
          this.userUnauthorized = true;
        }
        return err;
      })
    );
    this.exceptionsList$ = this.ws.get<any>(`/igraduate/exception`);
  }

  addException() {
    // stop here if form is invalid
    this.alertCtrl.create({
      header: 'Adding Exception',
      message: `Are you sure you want to add exception for ${this.studentIDException}:`,
      buttons: [
        {
          text: 'No',
          handler: () => { }
        },
        {
          text: 'Yes',
          handler: () => {
            this.presentLoading();
            this.ws.post<any>(`/igraduate/add_exception?id=${this.studentIDException}`).subscribe({
              next: () => {
                this.component.toastMessage('Exception added successfully!', 'success');
              },
              error: () => {
                this.dismissLoading();
                this.component.toastMessage('Something went wrong! please try again or contact us via the feedback page', 'danger');
              },
              complete: () => {
                this.studentIDException = '';
                this.dismissLoading();
                this.doRefresh();
              }
            });
          }
        }
      ]
    }).then(confirm => confirm.present());
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

  async openStudentDetailModal(studentId) {
    const modal = await this.modalCtrl.create({
      component: StudentDetailsModalPage,
      cssClass: 'add-min-height',
      // TODO: store search history
      componentProps: { studentId, notFound: 'No news Selected' },
    });
    await modal.present();
    // default item to current intake if model dismissed without data
    await modal.onDidDismiss();
  }
}
