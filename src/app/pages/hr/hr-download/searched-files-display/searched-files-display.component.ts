
import { Component, Input, OnInit } from '@angular/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ModalController, Platform } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CasTicketService, WsApiService } from 'src/app/services';

@Component({
  selector: 'app-searched-files-display',
  templateUrl: './searched-files-display.component.html',
  styleUrls: ['./searched-files-display.component.scss'],
})
export class SearchedFilesDisplayComponent implements OnInit {
  @Input() staffSamAccountName: any;
  ePayslipUrl = 'https://api.apiit.edu.my';

  files$: Observable<any[]>;
  dateToFilter;
  fileToFilter;

  constructor(
    public modalCtrl: ModalController,
    private ws: WsApiService,
    private cas: CasTicketService,
    private platform: Platform,
    private fileOpener: FileOpener
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh() {
    this.files$ = this.ws.get<any>(`/epayslip/find?sam_account_name=${this.staffSamAccountName}`).pipe(
      map(files => [...files.ea_form, ...files.payslips, ...files.pcb_form]),
      map(files => files.sort((a, b) => 0 - (a > b ? 1 : -1))),
      catchError(error => of(error))
    );
  }

  downloadPayslipPdf(payslip) {
    const downloadPayslipEndpoint = '/epayslip/download/';
    const link = this.ePayslipUrl + downloadPayslipEndpoint + payslip;

    this.cas.getST(link).subscribe(st => {
      fetch(link + `?ticket=${st}`).then(result => result.blob()).then(async blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });

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

  dismissModal() {
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
