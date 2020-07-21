import { Component, OnInit } from '@angular/core';
import { StudentTimetable } from 'src/app/interfaces';
// tslint:disable-next-line: ordered-imports
import { Observable } from 'rxjs';
import { StudentTimetableService } from 'src/app/services';
// tslint:disable-next-line: ordered-imports
import { tap, map } from 'rxjs/operators';
// tslint:disable-next-line: ordered-imports
import * as moment from 'moment';

@Component({
  selector: 'app-control-room-dashboard',
  templateUrl: './control-room-dashboard.page.html',
  styleUrls: ['./control-room-dashboard.page.scss'],
})
export class ControlRoomDashboardPage implements OnInit {
  today = new Date();

  timetable$: Observable<StudentTimetable[]>;
  classesChart = {
    type: 'line',
    options: {
      legend: {
        display: false,
      },
    },
    data: {
      labels: [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
      ],
      datasets: [
        {
          label: 'Classes',
          data: [9, 1, 20, 8, 8, 13, 6, 31, 10, 2, 0],
          borderColor: 'rgb(224, 20, 57, .7)',
          backgroundColor: 'rgb(224, 20, 57, .3)',
          fill: true,
        }
      ],
    }
  };

  usersChart = {
    type: 'line',
    options: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    data: {
      labels: [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
      ],
      datasets: [
        {
          label: 'Students',
          data: [50, 140, 190, 200, 400, 320, 122, 133, 168, 190, 100],
          borderColor: 'rgb(56, 128, 255, .7)',
          backgroundColor: 'rgb(56, 128, 255, .3)',
          fill: false,
        },
        {
          label: 'Staff',
          data: [190, 320, 122, 133, 168, 190, 100, 200, 400, 50, 140],
          borderColor: 'rgb(73, 181, 113, .7)',
          backgroundColor: 'rgb(73, 181, 113, .3)',
          fill: false,
        },
        {
          label: 'Visitors',
          data: [200, 400, 50, 140, 168, 190, 320, 122, 133, 190, 100],
          borderColor: 'rgb(227, 136, 39, .7)',
          backgroundColor: 'rgb(227, 136, 39, .3)',
          fill: false,
        },
      ],
    }
  };

  labChart = {
    type: 'horizontalBar',
    options: {
      legend: {
        display: false
      },
    },
    data: {
      labels: [
        'Level 1',
        'Level 3',
        'Level 4',
        'Level 5',
        'Level 6'
      ],
      datasets: [
        {
          label: 'Entries',
          data: [50, 140, 190, 200, 122],
          borderColor: ['rgb(56, 128, 255, .7)', 'rgb(73, 181, 113, .7)', 'rgb(227, 136, 39, .7)', 'rgb(138, 39, 204, .3)', 'rgb(227, 61, 27, .3)'],
          backgroundColor: ['rgb(56, 128, 255, .3)', 'rgb(73, 181, 113, .3)', 'rgb(227, 136, 39, .3)', 'rgb(138, 39, 204, .3)', 'rgb(227, 61, 27, .3)'],
        }
      ],
    }
  };
  constructor(
    private tt: StudentTimetableService
  ) { }

  ngOnInit() {
    const classesPerHour = {
      8: 0,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
      13: 0,
      14: 0,
      15: 0,
      16: 0,
      17: 0,
      18: 0
    };
    this.timetable$ = this.tt.get(true).pipe( // force refersh for now
      map(res => res.filter(item => item.MODID.includes('(on-campus)') && moment(new Date()).format('YYYY-MM-DD') === item.DATESTAMP_ISO)),
      tap(res => {
        res.forEach(item => {
          if (item.TIME_FROM.startsWith('08')) {
            classesPerHour[8] += 1;
            this.classesChart.data.datasets[0].data[0] = classesPerHour[8];
          }
          if (item.TIME_FROM.startsWith('09')) {
            classesPerHour[9] += 1;
          }
          if (item.TIME_FROM.startsWith('10')) {
            classesPerHour[10] += 1;
          }
          if (item.TIME_FROM.startsWith('11')) {
            classesPerHour[11] += 1;
          }
          if (item.TIME_FROM.startsWith('12')) {
            classesPerHour[12] += 1;
          }
          if (item.TIME_FROM.startsWith('01')) {
            classesPerHour[13] += 1;
          }
          if (item.TIME_FROM.startsWith('02')) {
            classesPerHour[14] += 1;
          }
          if (item.TIME_FROM.startsWith('03')) {
            classesPerHour[15] += 1;
          }
          if (item.TIME_FROM.startsWith('04')) {
            classesPerHour[16] += 1;
          }
          if (item.TIME_FROM.startsWith('05')) {
            classesPerHour[17] += 1;
          }
          if (item.TIME_FROM.startsWith('06')) {
            classesPerHour[18] += 1;
          }
        });
        // this.classesChart.data.datasets[0].data =
      }),
      tap(_ => console.log(classesPerHour))
    );
  }

}
