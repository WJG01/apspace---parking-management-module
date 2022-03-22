import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController, Platform } from '@ionic/angular';

import { format, formatISO } from 'date-fns';
import { Filesystem, Directory } from '@capacitor/filesystem';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { DatePickerComponent } from '../../../components/date-picker/date-picker.component';
import { ComponentService } from '../../../services';
import { Apcard } from '../../../interfaces';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-print-transactions-modal',
  templateUrl: './print-transactions-modal.page.html',
  styleUrls: ['./print-transactions-modal.page.scss'],
})
export class PrintTransactionsModalPage implements OnInit {

  @Input() transactions: Apcard[];
  createReport: FormGroup;
  types = ['all', 'credit', 'debit'];
  noTransactionFound: boolean;
  todayDate = new Date();

  pdfObj = null; // Used to generate report
  tableBody: any;
  summaryBody: any;
  pdfTitle = '';

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private component: ComponentService,
    private plt: Platform,
    private fileOpener: FileOpener,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.createReport = this.fb.group({
      month: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  async openPicker() {
    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'month-year',
        minDate: '2019-01-01',
        maxDate: format(new Date(), 'yyyy-MM-dd'),
      },
      cssClass: 'date-picker-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.month) {
      this.month.setValue(data.month);
    }
  }

  async generatePdf() {
    if (!this.month.value) {
      return this.component.toastMessage('Please select a Month!', 'warning');
    }

    if (!this.type.value) {
      return this.component.toastMessage('Please select a Type!', 'warning');
    }

    const loading = await this.loadingCtrl.create({
      message: 'Generating PDF...',
    });
    await loading.present();

    const yearMonthDate = new Date(this.month.value);
    let numberOfItems = 0, totalSpent = 0, totalTopup = 0;
    this.tableBody = [ // empty the list whenever there is an update
      [
        { text: '#', bold: true, style: 'tableHeader' },
        { text: 'Date', bold: true, style: 'tableHeader' },
        { text: 'Time', bold: true, style: 'tableHeader', alignment: 'center' },
        { text: 'Item', bold: true, style: 'tableHeader' },
        { text: 'Value', bold: true, style: 'tableHeader', alignment: 'center' },
      ]
    ];

    this.transactions.filter(transaction => {
      const spendDateObj = new Date(transaction.SpendDate);
      return (spendDateObj.getMonth() === yearMonthDate.getMonth() && spendDateObj.getFullYear() === yearMonthDate.getFullYear()) &&
        (this.type.value === 'credit'
          ? transaction.ItemName.toLowerCase() === 'top up'
          : this.type.value === 'debit'
            ? transaction.ItemName.toLowerCase() !== 'top up'
            : true
        );

    }).reverse().forEach((transaction, index: number) => {
      const studentData = [
        { text: index + 1, alignment: 'center', style: transaction.ItemName === 'Top Up' ? 'greenText' : 'tableCell' },
        { text: formatISO(new Date(transaction.SpendDate), { representation: 'date' }), style: transaction.ItemName === 'Top Up' ? 'greenText' : 'tableCell' },
        { text: transaction.SpendTime, alignment: 'center', style: transaction.ItemName === 'Top Up' ? 'greenText' : 'tableCell' },
        { text: transaction.ItemName, style: transaction.ItemName === 'Top Up' ? 'greenText' : 'tableCell' },
        { text: Math.abs(transaction.SpendVal), alignment: 'center', style: transaction.ItemName === 'Top Up' ? 'greenText' : 'redText' },
      ];
      numberOfItems += 1;
      totalSpent += transaction.ItemName.toLowerCase() !== 'Top Up'.toLowerCase() ? Math.abs(transaction.SpendVal) : 0;
      totalTopup += transaction.ItemName.toLowerCase() === 'Top Up'.toLowerCase() ? Math.abs(transaction.SpendVal) : 0;

      this.tableBody.push(studentData);
    });

    if (this.tableBody.length === 1) {
      loading.dismiss();
      return this.component.toastMessage(`No Transactions For ${format(yearMonthDate, 'MMMM yyyy')}`, 'warning');
    }


    this.pdfTitle = `${this.type.value}_apcard_transactions_for_${yearMonthDate.getFullYear()}_${yearMonthDate.getMonth() + 1}`;

    const docDefinition = {
      info: {
        title: this.pdfTitle,
        author: 'APSpace_Reports',
        subject: `APCard @ ${this.todayDate.toString()}`,
        keywords: 'APCard APSpace Reports',
        creator: 'APSpace_Reports',
        producer: 'APSpace_Reports',
        creationDate: this.todayDate.toDateString(),
        modDate: this.todayDate.toDateString()
      },
      content: [
        {
          text: 'APIIT Education Group',
          style: 'header',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        },

        {
          text: 'APCard Transactions Monthly Report',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        },

        {
          text: `Report for ${format(yearMonthDate, 'MMMM, yyyy')}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        },

        {
          text: this.type.value === 'credit' ? '** Credit Only **' : this.type.value === 'debit' ? '** Debit Only **' : '',
          style: this.type.value === 'credit' ? 'green_subheader' : this.type.value === 'debit' ? 'red_subheader' : '',
          alignment: 'center',
          margin: this.type.value === 'all' ? [0, 0, 0, 0] : [0, 10, 0, 0]
        },

        { text: '', margin: [5, 20, 5, 10] },

        {
          layout: 'noBorders',
          fillColor: '#dbdbdb',
          color: '#000000',
          table: {
            headerRows: 1,
            widths: ['70%', '30%'],
            body: [
              [
                { text: 'Student ID', bold: true, margin: [5, 5, 5, 5] },
                { text: this.transactions[0].SNO, alignment: 'right', margin: [5, 5, 5, 5] }
              ],
              [
                { text: 'Number of items', bold: true, margin: [5, 5, 5, 5] },
                { text: (numberOfItems === 1 ? numberOfItems + ' Item' : numberOfItems + ' Items'), alignment: 'right', margin: [5, 5, 5, 5] }
              ],
              [
                { text: 'Total debit in the month:', bold: true, margin: [5, 5, 5, 5] },
                { text: ('RM' + totalSpent.toFixed(2)), alignment: 'right', margin: [5, 5, 5, 5], color: '#e54d42' }
              ],
              [
                { text: 'Total credit in the month:', bold: true, margin: [5, 5, 5, 5] },
                { text: ('RM' + totalTopup.toFixed(2)), alignment: 'right', margin: [5, 5, 5, 5], color: '#346948' }
              ]
            ],
            pageBreak: 'after'
          }
        },

        { text: '', margin: [5, 20, 5, 10] },


        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', '*', 'auto'],
            body: this.tableBody,
            pageBreak: 'after'
          }
        },

      ],
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            { width: '5%', text: '' },
            {
              width: '75%',
              text: `Generated using APSpace (${this.todayDate.toDateString()})`,
              alignment: 'left',
              style: 'greyColor'
            },
            {
              width: '5%',
              text: ''
            },
            {
              width: '10%',
              text: currentPage.toString() + ' of ' + pageCount,
              alignment: 'right',
              style: 'greyColor'
            },
            { width: '5%', text: '' }
          ]
        };
      },

      styles: {
        greyColor: {
          color: '#8a8a8a'
        },
        tableHeader: {
          color: '#FFFFFF',
          fillColor: '#3a99d9',
          margin: [5, 5, 5, 5]
        },
        tableCell: {
          margin: [5, 5, 5, 5]
        },
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 0]
        },
        green_subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 0],
          color: '#346948'
        },
        red_subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 0],
          color: '#e54d42'
        },
        subheader2bold: {
          fontSize: 12,
          bold: true,
          margin: [0, 15, 0, 0]
        },
        subheader2: {
          fontSize: 12,
          bold: false,
          margin: [0, 15, 0, 0]
        },
        story: {
          italic: true,
          alignment: 'center',
          width: '50%',
        },
        greenText: {
          color: '#346948',
          fillColor: '#e4f7e9',
          margin: [5, 5, 5, 5]
        },
        redText: {
          color: '#e54d42',
          margin: [5, 5, 5, 5]
        },
        blueText: {
          color: '#3a99d9'
        }
      }
    };
    this.pdfObj = pdfMake.createPdf(docDefinition);
    // Download PDF
    if (this.plt.is('capacitor')) {
      this.pdfObj.getBase64(async (data) => {
        try {
          let path = `apspace/pdf/${this.pdfTitle}`;
          // Save the PDF to the data Directory of our App
          const result = await Filesystem.writeFile({
            path,
            data,
            directory: Directory.Documents,
            recursive: true
          });
          // Dismiss loading & open the PDf with the correct OS tools
          loading.dismiss();
          this.fileOpener.open(`${result.uri}`, 'application/pdf');
        } catch (err) {
          console.error('Unable to Create File');
        }
      });
    } else {
      loading.dismiss();
      this.pdfObj.download(this.pdfTitle + '.pdf');
    }
  }

  reset() {
    this.createReport.reset();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  get month(): AbstractControl {
    return this.createReport.get('month');
  }

  get type(): AbstractControl {
    return this.createReport.get('type');
  }
}
