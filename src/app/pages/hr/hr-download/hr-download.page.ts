import { Component } from '@angular/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { AlertController, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CasTicketService, WsApiService } from 'src/app/services';
import { SearchedFilesDisplayComponent } from './searched-files-display/searched-files-display.component';


@Component({
  selector: 'app-hr-download',
  templateUrl: './hr-download.page.html',
  styleUrls: ['./hr-download.page.scss'],
})
export class HrDownloadPage {

  files$: Observable<any[]>;
  // ePayslipUrl = 'https://t16rz80rg7.execute-api.ap-southeast-1.amazonaws.com/staging';
  payslipsUrl = 'https://api.apiit.edu.my';

  dateToFilter;
  fileToFilter;
  canAccessPayslipFileSearch;
  segmentValue = 'myFiles';

  constructor(
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private platform: Platform,
    private storage: Storage,
    private fileOpener: FileOpener,
    private ws: WsApiService,
    private cas: CasTicketService
  ) { }

  ionViewWillEnter() {
    this.storage.get('canAccessPayslipFileSearch').then(
      canAccessPayslipFileSearch => this.canAccessPayslipFileSearch = canAccessPayslipFileSearch
    );
    this.doRefresh();
  }

  doRefresh() {
    this.files$ = this.ws.get<any>('/epayslip/list').pipe(
      map(files => [...files.ea_form, ...files.payslips, ...files.pcb_form]),
      map(files => files.sort((a, b) => 0 - (a > b ? 1 : -1))),
      catchError(error => of(error))
    );
  }

  downloadPayslipPdf(payslip) {
    const downloadPayslipEndpoint = '/epayslip/download/';
    const link = this.payslipsUrl + downloadPayslipEndpoint + payslip;

    this.cas.getST(link).subscribe(st => {
      fetch(link + `?ticket=${st}`).then(result => result.json())
        .then(async data => {
          // Convert base64 to byte
          const byteArray = new Uint8Array(atob(data.body).split('').map(char => char.charCodeAt(0)));
          const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });

          if (this.platform.is('capacitor')) {
          try {
            let path = `apspace/pdf/${payslip}`;
            const data: any = await this.blobToBase64(pdfBlob)
            // Save the PDF to the data Directory of our App
            const result = await Filesystem.writeFile({
              path,
              data,
              directory: Directory.Documents,
              recursive: true
            });
            // Dismiss loading & open the PDf with the correct OS tools
            this.fileOpener.open(`${result.uri}`, 'application/pdf');
          } catch (err) {
            console.error('Unable to Create File');
          }
        } else {
          const blobUrl = URL.createObjectURL(pdfBlob);
          const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;

          a.href = blobUrl;
          a.download = payslip;
          document.body.appendChild(a);
          a.click();

          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          }, 5000);
        }
      });
    });
  }

  displayAllFiles() {
    this.dateToFilter = '';
    this.fileToFilter = '';
  }

  segmentChanged(event: any) {
    this.dateToFilter = '';
    this.fileToFilter = '';

    if (event.detail.value === 'myFiles') {
      this.doRefresh();
    } else {
      this.files$ = of([]);
    }
  }

  viewSearchedStaffFiles($event) {
    const staffSamAccountName = $event;

    this.modalCtrl.create({
      component: SearchedFilesDisplayComponent,
      cssClass: 'glob-partial-page-modal',
      componentProps: {
        staffSamAccountName
      }
    }).then(modal => {
      modal.present();
    });
  }

  syncFiles() {
    this.alertCtrl.create({
      header: 'Perform synchronize?',
      buttons: [
        {
          text: 'Yes',
          handler: _ => {
            this.presentLoading();
            this.ws.get<any>('/epayslip/sync').subscribe({
              next: () => {
                this.presentAlert('Success!', 'Synchronized', 'The synchronize is done.', 'success-alert');
              },
              error: () => {
                this.dismissLoading();
                this.presentAlert('Alert!', 'Synchronize Failed.', 'The synchronize is failed.', 'danger-alert');
              },
              complete: () => {
                this.dismissLoading();
              }
            });
          }
        }, {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present());
  }

  presentAlert(header: string, subHeader: string, message: string, cssClass) {
    this.alertCtrl.create({
      cssClass,
      header,
      subHeader,
      message,
      buttons: ['OK']
    }).then(alert => alert.present());
  }

  presentLoading() {
    this.loadingCtrl.create({
      spinner: 'dots',
      message: 'Please wait...',
      translucent: true,
    }).then(loading => loading.present());
  }

  dismissLoading() {
    this.loadingCtrl.dismiss();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}
