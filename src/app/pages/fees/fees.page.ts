import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { IonContent, MenuController } from '@ionic/angular';

import { ChartComponent } from 'angular2-chartjs';

import { WsApiService } from 'src/app/services';
import {
  FeesBankDraft,
  FeesDetails,
  FeesSummary,
  FeesTotalSummary
} from '../../interfaces';

import * as moment from 'moment';

declare var Chart: any;

@Component({
  selector: 'app-fees',
  templateUrl: './fees.page.html',
  styleUrls: ['./fees.page.scss'],
  animations: [
    trigger('buttonEnterOut', [
      transition(':enter', [
        style({ transform: 'rotate(-90deg) scale(0)' }),
        animate('0.2s ease-out', style({ transform: 'rotate(0) scale(1)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.15s ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class FeesPage {
  selectedSegment = 'Summary';

  totalSummary$: Observable<FeesTotalSummary[]>;
  bankDraft$: Observable<FeesBankDraft[]>;
  detail$: Observable<FeesDetails[]>;
  summary$: Observable<FeesSummary[]>;

  labels: {
    name: string;
    visible: boolean;
  }[];
  visibleLabels: string[];  // Used by filter pipe to determine card items to be displayed

  @ViewChild('content', { static: true }) content: IonContent;
  @ViewChild('financialsChartComponent')
  financialsChartComponent: ChartComponent;
  financial$: Observable<FeesTotalSummary>;
  financialsChart: {
    type: string;
    options: any;
    data: {
      labels: string[];
      datasets: {
        label: string;
        data: [number];
        backgroundColor: string;
      }[];
    };
  } = {
      type: 'bar',
      options: {
        scales: {
          xAxes: [{ stacked: true }],
          yAxes: [{ stacked: true }]
        },
        responsive: true,
        legend: {}
      },
      data: null
    };

  numberOfSkeletons = new Array(6);

  constructor(private menuCtrl: MenuController, private ws: WsApiService) { }

  ionViewDidEnter() {
    this.doRefresh();
  }

  openFilterMenu() {
    this.menuCtrl.toggle();
  }

  doRefresh(refresher?) {
    const that = this;

    this.totalSummary$ = this.ws.get('/student/summary_overall_fee', refresher);
    this.summary$ = this.ws.get<FeesSummary[]>('/student/outstanding_fee', refresher).pipe(
      tap(summuries => summuries
        .map(summury => summury.PAYMENT_DUE_DATE ? summury.PAYMENT_DUE_DATE = summury.PAYMENT_DUE_DATE.replace(/-/g, ' ') : ''))
    );
    this.bankDraft$ = this.ws.get('/student/bankdraft_amount', refresher);
    this.detail$ = this.ws.get<FeesDetails[]>('/student/overall_fee', refresher).pipe(
      tap(details => details.map(detail => detail.DUE_DATE = moment(detail.DUE_DATE, 'DD-MMM-YY').toString()))
    );

    this.totalSummary$ = this.totalSummary$.pipe(
      tap(overdueSummary => {
        this.financialsChart.data = {
          labels: ['Financial Status'],
          datasets: [
            {
              label: 'Paid',
              data: [+overdueSummary[0].TOTAL_PAID],
              backgroundColor: '#49b571' // Green
            },
            {
              label: 'Outstanding',
              data: [+overdueSummary[0].TOTAL_OUTSTANDING],
              backgroundColor: '#dfa847' // Yellow
            },
            {
              label: 'Overdue',
              data: [+overdueSummary[0].TOTAL_OVERDUE],
              backgroundColor: '#e54d42' // Red
            },
            {
              label: 'Fine',
              data: [+overdueSummary[0].FINE],
              backgroundColor: '#ec2a4d' // Pink
            }
          ]
        };

        this.labels = this.financialsChart.data.datasets.map(
          dataset => ({
            name: dataset.label,
            visible: true
          })
        );
      }),
      finalize(() => refresher && refresher.target.complete()),


    );

    this.financialsChart.options.legend.onClick = function(event, legendItem) {
      Chart.defaults.global.legend.onClick.call(this, event, legendItem);

      that.labels[legendItem.datasetIndex].visible = legendItem.hidden;
      that.visibleLabels = that.getVisibleLabels();
    };

  }


  updateChartLabelVisibility(labelIndex: number, visible: boolean) {
    this.financialsChartComponent.chart.data.datasets[labelIndex]._meta['0'].hidden = !visible;
    this.financialsChartComponent.chart.update();
    this.visibleLabels = this.getVisibleLabels();
  }

  segmentValueChanged() {
    this.content.scrollToTop();
  }

  getVisibleLabels(): string[] {
    return this.financialsChartComponent.chart.data.datasets
      .filter(dataset => !dataset._meta['0'].hidden)
      .map(dataset => dataset.label);
  }

  isNumber(val: any): boolean {
    return typeof val === 'number';
  }
}
