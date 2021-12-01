import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { format } from 'date-fns';
import { Observable, Subscription } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { WsApiService } from 'src/app/services';
import { NotifierService } from 'src/app/shared/notifier/notifier.service';
import { Apcard } from '../../interfaces';
import { PrintTransactionsModalPage } from './print-transactions-modal/print-transactions-modal';

@Component({
  selector: 'app-apcard',
  templateUrl: './apcard.page.html',
  styleUrls: ['./apcard.page.scss'],
})
export class ApcardPage implements OnInit, OnDestroy {

  transaction$: Observable<Apcard[]>;
  skeleton = new Array(2);
  transactions: Apcard[];
  balance: number;
  indecitor = false;
  todayDate = format(new Date(), 'dd MMM yyyy');
  timeFormatChangeFlag: boolean;
  notification: Subscription;

  constructor(
    private ws: WsApiService,
    private router: Router,
    private modalCtrl: ModalController,
    private notifierService: NotifierService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.notification = this.notifierService.apCardUpdated.subscribe(data => {
      if (data && data === 'SUCCESS') {
        this.timeFormatChangeFlag = !this.timeFormatChangeFlag;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.indecitor = true;
  }

  ionViewDidEnter() {
    /*
      * The page's response is very huge, which is causing issues on ios if we use oninit
      * the indecitor is used to define if the page should call the dorefresh of not
      * If we do not use the indecitor, the page in the tabs (tabs/apcard) will be reloading every time we enter the tab
    */
    if (this.indecitor) {
      this.doRefresh();
      this.indecitor = false;
    }
  }

  ngOnDestroy() {
    this.notification.unsubscribe();
  }

  /** Generating header value (virtual scroll) */
  seperatebyMonth(record: Apcard, recordIndex: number, records: Apcard[]) {
    if (recordIndex === 0) { // first header value - current month
      return format(new Date(record.SpendDate), 'MMMM yyyy').toUpperCase();
    }
    const previousRecordDate = format(new Date(records[recordIndex - 1].SpendDate), 'MMMM yyyy');
    const currentRecordDate = format(new Date(record.SpendDate), 'MMMM yyyy');

    if (previousRecordDate !== currentRecordDate) {
      return currentRecordDate.toUpperCase();
    }
    return null;
  }

  getAbsoluteValue(num: number): number {
    return Math.abs(num);
  }

  doRefresh(refresher?) {
    this.transaction$ = this.ws.get<Apcard[]>('/apcard/', refresher).pipe(
      tap(transactions => {
        if (transactions.length < 1) {
          return;
        }

        this.transactions = transactions;
        this.balance = transactions[0].Balance;
      }),
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    );
  }

  comingFromTabs() {
    if (this.router.url.split('/')[1].split('/')[0] === 'tabs') {
      return true;
    }
    return false;
  }

  async generateMonthlyTransactionsPdf() {
    const modal = await this.modalCtrl.create({
      component: PrintTransactionsModalPage,
      componentProps: {
        transactions: this.transactions
      },
      cssClass: 'glob-partial-page-modal',
    });
    await modal.present();
    await modal.onDidDismiss();
  }

}
