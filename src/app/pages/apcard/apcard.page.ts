import { Component, OnInit } from '@angular/core';
import { finalize, map, Observable, Subscription, tap } from 'rxjs';
import { ModalController } from '@ionic/angular';

import { format } from 'date-fns';

import { Apcard } from '../../interfaces';
import { ConfigurationsService, WsApiService } from '../../services';
import { PrintTransactionsModalPage } from './print-transactions-modal/print-transactions-modal.page';

@Component({
  selector: 'app-apcard',
  templateUrl: './apcard.page.html',
  styleUrls: ['./apcard.page.scss'],
})
export class ApcardPage implements OnInit {

  transaction$: Observable<Apcard[]>;
  skeleton = new Array(2);
  transactions: Apcard[];
  balance: number;
  todayDate = format(new Date(), 'dd MMM yyyy');
  currentYear = new Date().getFullYear();
  timeFormatChangeFlag: boolean;
  notification: Subscription;
  transactionYears = [];
  filterObject = {
    year: this.currentYear,
    type: 'all',
    showThisMonthOnly: false
  };
  noBalance: boolean;
  hideHeader: boolean;

  constructor(
    private ws: WsApiService,
    private modalCtrl: ModalController,
    private config: ConfigurationsService
  ) { }

  ngOnInit() {
    this.doRefresh();
    this.hideHeader = this.config.comingFromTabs;
  }

  doRefresh(refresher?) {
    this.transaction$ = this.ws.get<Apcard[]>('/apcard/', refresher).pipe(
      tap(transactions => {
        if (transactions.length < 1) {
          this.noBalance = true;
          return;
        }
        for (const t of transactions) {
          const spendYear = new Date(t.SpendDate).getFullYear();
          if (this.transactionYears.indexOf(spendYear) <= -1) {
            this.transactionYears.push(spendYear);
          }
        }
        // Check if current year exists in the array
        if (!this.transactionYears.includes(this.currentYear)) {
          this.transactionYears.unshift(this.currentYear);
        }

        this.transactions = transactions;
        this.balance = transactions[0].Balance;
      }),
      map(transactions => {
        let filteredtransactions = transactions.filter(t => {
          const transactionYear = new Date(t.SpendDate).getFullYear();

          return transactionYear === this.filterObject.year;
        });

        if (this.filterObject.year !== this.currentYear) {
          filteredtransactions = filteredtransactions.filter(t => {
            const transactionYear = new Date(t.SpendDate).getFullYear();

            return transactionYear === this.filterObject.year;
          });
        }

        if (this.filterObject.type !== 'all') {
          return filteredtransactions =
            filteredtransactions.filter(t =>
              this.filterObject.type === 'credit' ? t.SpendVal >= 0 : t.SpendVal < 0);
        }

        if (this.filterObject.showThisMonthOnly) {
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;

          filteredtransactions = filteredtransactions.filter(e => {
            const formattedDate = format(new Date(e.SpendDate), 'yyyy-MM-dd');
            const yearMonth = `${currentYear}-${formattedMonth}`;
            return formattedDate.indexOf(yearMonth) !== -1;
          });
        }

        return filteredtransactions;
      }),
      finalize(() => {
        if (refresher) {
          refresher.target.complete();
        }
      })
    );
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

  resetFilters() {
    this.filterObject = {
      year: this.currentYear,
      type: 'all',
      showThisMonthOnly: false
    };
    this.doRefresh();
  }

  getAbsoluteValue(num: number): number {
    return Math.abs(num);
  }

  async generateMonthlyTransactionsPdf() {
    const modal = await this.modalCtrl.create({
      component: PrintTransactionsModalPage,
      componentProps: {
        transactions: this.transactions
      },
      breakpoints: [0, 0.7],
      initialBreakpoint: 0.7
    });
    await modal.present();
  }
}
