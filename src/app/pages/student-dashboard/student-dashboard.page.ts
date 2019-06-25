import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EventComponentConfigurations, DashboardCardComponentConfigurations } from 'src/app/interfaces';
import * as moment from 'moment';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.page.html',
  styleUrls: ['./student-dashboard.page.scss'],
})
export class StudentDashboardPage implements OnInit {
  @ViewChild('apcardChart') apcardChart: ElementRef;
  @ViewChild('cgpaChart') cgpaChart: ElementRef;
  @ViewChild('financialsChart') financialsChart: ElementRef;
  @ViewChild('lowAttendanceChart') lowAttendanceChart: ElementRef;
  constructor(
  ) { }

  ngOnInit() {
    this.createApcardChart();
    this.createCgpaChart();
    this.createFinancialsChart();
    this.createLowAttendanceChart();
  }

  // ALERTS SLIDER OPTIONS
  alertSliderOptions = {
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    speed: 500,
  };


  // Today's Schedule:
  todaysScheduleCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: true,
    options: [
      {
        title: 'set alarm before 15 minutes of next schdule',
        icon: 'alarm',
        callbackFunction: this.testCallBack
      },
      {
        title: 'delete',
        icon: 'trash',
        callbackFunction: this.testCallBack
      }
    ],
    cardTitle: "Today's Schedule",
    cardSubtitle: 'Next in: 1 hrs, 25 min'
  }

  // Today's Schedule:
  upcomingEventsCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: true,
    options: [
      {
        title: 'set alarm before 15 minutes of next schdule',
        icon: 'alarm',
        callbackFunction: this.testCallBack
      },
      {
        title: 'delete',
        icon: 'trash',
        callbackFunction: this.testCallBack
      }
    ],
    cardTitle: "Upcoming Events",
    cardSubtitle: 'Today: ' + moment().format("DD MMMM YYYY")
  }

  // APCard Transactions:
  apcardTransactionsCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: "APCard Transactions",
    cardSubtitle: 'Balance: RM500.99',
    contentPadding: true
  }

  createApcardChart() {
    const ctx = this.apcardChart.nativeElement.getContext('2d');
    const apcardChart = new Chart(ctx, {
      type: this.apcardChartType,
      options: this.apcardChartOptions,
      data: this.apcardChartData
    });
  }

  apcardChartData = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'Monthly Credit',
        data: ['22', '10', '14', '30', '0', '0', '12', '100', '201', '10', '0', '0'],
        borderColor: 'rgba(46, 204, 113, .7)',
        backgroundColor: 'rgba(46, 204, 113, .3)',
        fill: true,
      },
      {
        label: 'Monthly Debit',
        data: ['12', '15', '27', '1', '200', '10', '2', '10', '21', '0', '20', '50'],
        borderColor: 'rgba(192, 57, 43, .7)',
        backgroundColor: 'rgba(192, 57, 43, .3)',
        fill: true,
      },
    ],
  };
  apcardChartType = 'line';
  apcardChartOptions = [
    {
      legend: {
        display: true,
        position: 'right',
      },
    },
    {
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              max: 4,
            },
          },
        ],
      },
    },
  ]

  // CGPA
  cgpaCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: "CGPA Per Intake",
    cardSubtitle: 'Overall: 3.9',
    contentPadding: true
  }

  createCgpaChart() {
    const ctx = this.cgpaChart.nativeElement.getContext('2d');
    const cgpaChart = new Chart(ctx, {
      type: this.cgpaChartType,
      options: this.cgpaChartOptions,
      data: this.cgpaChartData
    });
  }

  cgpaChartData = {
    labels: [
      "UC1F1506IT",
      "UC2F1605IT(ISS)",
      "UC3F1706IT(ISS)"
    ],
    datasets: [
      {
        data: [3.8, 3.3, 3.5],
        backgroundColor: ["rgb(255,0,0,0.3)", "rgba(0,255,0,0.3)", "rgba(0,0,255,0.3)"],
      }]
  };
  cgpaChartType = 'horizontalBar';

  cgpaChartOptions = {
    scales: {
      xAxes: [{
        ticks: {
          min: 0,
          max: 4
        }
      },
      ],
      yAxes: [{
        gridLines: {
          color: "rgba(0, 0, 0, 0)",
        },
        ticks: {
          beginAtZero: true,
          mirror: true,
          padding: -10
        },
      }]
    },
    responsive: true,
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  }

  // FINANCIALS
  financialsCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: "Financials:",
    cardSubtitle: 'Overdue: RM5000',
    contentPadding: true
  }

  createFinancialsChart() {
    const ctx = this.financialsChart.nativeElement.getContext('2d');
    const financialsChart = new Chart(ctx, {
      type: this.financialsChartType,
      options: this.financialsChartOptions,
      data: this.financialsChartData
    });
  }

  financialsChartData = {
    labels: ['Financial Status'],
    datasets: [
      {
        label: 'Paid',
        data: [55172],
        backgroundColor: '#D6E9C6' // green
      },
      {
        label: 'Outstanding',
        data: [6000],
        backgroundColor: '#FAEBCC' // yellow
      },
      {
        label: 'Overdue',
        data: [4000],
        backgroundColor: '#EBCCD1' // red
      }
    ]
  };
  financialsChartType = 'bar';

  financialsChartOptions = {
    scales: {
      xAxes: [{ stacked: true }],
      yAxes: [{ stacked: true }]
    }
  }

  // LOW ATTENDANCE
  lowAttendanceCardConfigurations: DashboardCardComponentConfigurations = {
    withOptionsButton: false,
    cardTitle: "Low Attendance:",
    cardSubtitle: 'Overall: 80%',
    contentPadding: true
  }

  createLowAttendanceChart() {
    const ctx = this.lowAttendanceChart.nativeElement.getContext('2d');
    const lowAttendanceChart = new Chart(ctx, {
      type: this.lowAttendanceChartType,
      options: this.lowAttendanceChartOptions,
      data: this.lowAttendanceChartData
    });
  }

  lowAttendanceChartData = {
    labels: [
      "Introductions to Management",
      "Computing and IT in Workplace",
      "Designing and Developing applications on the cloud"
    ],
    datasets: [
      {
        data: [65, 71, 38],
        backgroundColor: ["rgb(255,0,0,0.3)", "rgba(0,255,0,0.3)", "rgba(0,0,255,0.3)"],
      }]
  };
  lowAttendanceChartType = 'horizontalBar';

  lowAttendanceChartOptions = {
    scales: {
      xAxes: [{
        ticks: {
          min: 0,
          max: 80
        }
      },
      ],
      yAxes: [{
        gridLines: {
          color: "rgba(0, 0, 0, 0)",
        },
        ticks: {
          beginAtZero: true,
          mirror: true,
          padding: -10
        },
      }]
    },
    responsive: true,
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  }

  testCallBack() {
    console.log('callback working');
  }

  // TO BE DELETED (MOCK DATA)
  todaysSchedule: EventComponentConfigurations[] = [{
    title: '1 hour class',
    color: '#27ae60',
    type: 'event-with-time-and-hyperlink',
    primaryDateTime: '08',
    secondaryDateTime: '30',
    quaternaryDateTime: 'AM',
    thirdDescription: 'Lower Ground Flr. SS Studio | New Campus',
    secondDescription: 'Mohamad Al Ghayeb',
    firstDescription: 'BM002-3-1-BES-T-2',
    pass: true
  },
  {
    title: '2 hours class',
    color: '#27ae60',
    type: 'event-with-time-and-hyperlink',
    primaryDateTime: '10',
    secondaryDateTime: '00',
    quaternaryDateTime: 'AM',
    thirdDescription: 'B-05-03 | New Campus',
    secondDescription: 'M. Reza Ganji',
    firstDescription: 'KS004-3-3-BAT-L-5',
    pass: true
  },
  {
    title: '2 hours class',
    color: '#27ae60',
    type: 'event-with-time-and-hyperlink',
    primaryDateTime: '02',
    secondaryDateTime: '00',
    quaternaryDateTime: 'PM',
    thirdDescription: 'B-07-03 | New Campus',
    secondDescription: 'Majd Samer Ahemd Suraj Al Waleed',
    firstDescription: 'AW004-3-3-BAT-L-5',
    pass: false
  },
  {
    title: 'Metting with Masters Supervisor',
    color: '#d35400',
    type: 'event-with-time-and-hyperlink',
    primaryDateTime: '02',
    secondaryDateTime: '30',
    quaternaryDateTime: 'PM',
    thirdDescription: 'B-07-03 | New Campus',
    secondDescription: 'M. Reza Ganji',
    firstDescription: 'reza.ganji@apiit.edu.my',
    pass: false
  },
  {
    title: 'Meeting with Dean',
    color: '#d35400',
    type: 'event-with-time-and-hyperlink',
    primaryDateTime: '04',
    secondaryDateTime: '00',
    quaternaryDateTime: 'PM',
    thirdDescription: 'LAB L3 - 08 | TPM',
    secondDescription: 'M. Reza Ganji',
    firstDescription: 'reza.ganji@apiit.edu.my',
    pass: false
  }
  ];

  upcomingEvents: EventComponentConfigurations[] = [{
    title: 'Hari Raya Holiday',
    color: '#121230',
    type: 'event-with-date-only',
    primaryDateTime: '22',
    secondaryDateTime: 'Jan',
    quaternaryDateTime: '2019',
    secondDescription: 'Until: 25 Jan 2019',
    firstDescription: 'Hari raya is blah blah blah',
    pass: false
  },
  {
    title: 'APU Football Competition',
    color: '#d35400',
    type: 'event-with-date-only',
    primaryDateTime: '25',
    secondaryDateTime: 'Sep',
    quaternaryDateTime: '2019',
    secondDescription: 'One day event',
    firstDescription: 'Hari raya is blah blah blah',
    thirdDescription: 'APU football pitch',
    pass: false
  },
  {
    title: 'Hari Raya Holiday Season 2',
    color: '#121230',
    type: 'event-with-date-only',
    primaryDateTime: '22',
    secondaryDateTime: 'Jan',
    quaternaryDateTime: '2019',
    secondDescription: 'Until: 25 Jan 2019',
    firstDescription: 'Hari raya is blah blah blah',
    pass: false
  },
  ];
}
