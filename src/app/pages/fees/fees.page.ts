import { Component, OnInit } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import Fuse from 'fuse.js';
import { parse } from 'date-fns';
import { ChartData, ChartOptions } from 'chart.js';

import { FeesTotalSummary, FeesBankDraft, FeesDetails, FeesSummary } from '../../interfaces';
import { WsApiService } from '../../services';
import { Router } from '@angular/router';

// For Chart Interface
interface ChartSummaryData {
  display: string;
  total: number;
}

@Component({
  selector: 'app-fees',
  templateUrl: './fees.page.html',
  styleUrls: ['./fees.page.scss'],
})
export class FeesPage implements OnInit {
  // Observables
  totalSummary$: Observable<FeesTotalSummary[]>;
  bankDraft$: Observable<FeesBankDraft[]>;
  details$: Observable<FeesDetails[]>;
  summary$: Observable<FeesSummary[]>;
  // Details Search Variables
  term = '';
  options: Fuse.IFuseOptions<FeesDetails> = {
    keys: [
      { name: 'ITEM_DESCRIPTION', weight: 0.2 },
      { name: 'DUE_DATE', weight: 0.1 },
      { name: 'AMOUNT_PAYABLE', weight: 0.1 },
      { name: 'OUTSTANDING', weight: 0.1 },
      { name: 'TOTAL_COLLECTED', weight: 0.1 }
    ]
  };
  // BankDraft Variables
  bankDraft: FeesBankDraft[];
  showSegment = false;
  // Chart Configs
  summaryChart: {
    options: ChartOptions,
    data: ChartData
  } = {
      options: {
        responsive: true,
        aspectRatio: 2
      },
      data: null
    }
  // Other Variables
  selectedSegment: 'summary' | 'bank-draft' | 'details' = 'summary';
  skeleton = new Array(3);

  constructor(
    private ws: WsApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh() {
    this.totalSummary$ = this.ws.get<FeesTotalSummary[]>('/student/summary_overall_fee');

    this.summary$ = this.ws.get<FeesSummary[]>('/student/outstanding_fee').pipe(
      tap(summaries => summaries.map(summary => summary.PAYMENT_DUE_DATE ? summary.PAYMENT_DUE_DATE = summary.PAYMENT_DUE_DATE.replace(/-/g, ' ') : ''))
    );

    this.bankDraft$ = this.ws.get<FeesBankDraft[]>('/student/bankdraft_amount').pipe(
      tap(b => {
        this.bankDraft = b;
        this.showSegment = !!(b[0].BANKDRAFT_AMOUNT !== 0);
      })
    );


    this.details$ = this.ws.get<FeesDetails[]>('/student/overall_fee').pipe(
      tap(details => details.map(detail => detail.DUE_DATE = parse(detail.DUE_DATE, 'dd-MMM-yy', new Date()).toString())),
      map(fees => fees.reverse()),
    );

    this.details$.pipe(
      tap(bankdrafts => {
        const chartData = {
          accommodation: {
            display: 'Accommodation',
            total: 0
          },
          bus: {
            display: 'Shuttle Card',
            total: 0
          },
          course: {
            display: 'Course Fee',
            total: 0
          },
          emgs: {
            display: 'EMGS',
            total: 0
          },
          others: {
            display: 'Others',
            total: 0
          }
        };
        let filteredChart: ChartSummaryData[] = [
          chartData.accommodation,
          chartData.bus,
          chartData.course,
          chartData.emgs,
          chartData.others
        ];

        for (const b of bankdrafts) {
          if (b.ITEM_DESCRIPTION.includes('Accommodation')) {
            chartData.accommodation.total += b.TOTAL_COLLECTED;
          }

          if (b.ITEM_DESCRIPTION.includes('Shuttle')) {
            chartData.bus.total += b.TOTAL_COLLECTED;
          }

          if (b.ITEM_DESCRIPTION.includes('Course Fee') || b.ITEM_DESCRIPTION.includes('SU')) {
            chartData.course.total += b.TOTAL_COLLECTED;
          }

          if (b.ITEM_DESCRIPTION.includes('EMGS') || b.ITEM_DESCRIPTION.includes('Immigration')) {
            chartData.emgs.total += b.TOTAL_COLLECTED;
          }

          if (!b.ITEM_DESCRIPTION.includes('Course Fee') &&
            !b.ITEM_DESCRIPTION.includes('SU') &&
            !b.ITEM_DESCRIPTION.includes('Accommodation') &&
            !b.ITEM_DESCRIPTION.includes('EMGS') &&
            !b.ITEM_DESCRIPTION.includes('Immigration') &&
            !b.ITEM_DESCRIPTION.includes('Shuttle')) {
            chartData.others.total += b.TOTAL_COLLECTED;
          }
        }
        // Filter to show only data that is more then 0
        filteredChart = filteredChart.filter(d => d.total > 0);

        this.showPieChart(filteredChart);
      })
    ).subscribe();
  }

  showPieChart(data: ChartSummaryData[]) {
    const randomColor = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(54,72,87,0.7)',
      'rgba(247,89,64,0.7)',
      'rgba(61,199,190,0.7)',
    ];

    this.summaryChart.data = {
      datasets: [{
        backgroundColor: randomColor,
        data: data.map(d => d.total)
      }],
      labels: data.map(d => d.display)
    }
  }

  openFeedback() {
    this.router.navigateByUrl('/feedback');
  }
}
