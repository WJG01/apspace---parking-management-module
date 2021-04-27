import { Component } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
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
    private file: File,
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
      fetch(link + `?ticket=${st}`).then(result => result.blob()).then(blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });

        if (this.platform.is('cordova')) {
          const directoryType = this.platform.is('android') ? this.file.externalDataDirectory : this.file.dataDirectory;

          // Save the PDF to the data Directory of our App
          this.file.writeFile(directoryType, `${payslip}.pdf`, pdfBlob, { replace: true }).then(_ => {
            // Open the PDf with the correct OS tools
            this.fileOpener.open(directoryType + `${payslip}.pdf`, 'application/pdf');
          });
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
            this.ws.get<any>('/epayslip/sync', { url: this.payslipsUrl }).subscribe({
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

}
