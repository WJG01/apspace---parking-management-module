import { Component, Input, OnInit } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

import { Observable } from 'rxjs/Observable';
import { map, tap } from 'rxjs/operators';

import { WsApiProvider } from '../../providers';
import { LecturerTimetable } from '../../interfaces';

@Component({
  selector: 'lecturer-timetable',
  templateUrl: 'lecturer-timetable.html',
  animations: [
    trigger('easeInOut', [
      transition('void => *', [
        style({ opacity: '.1', height: '0' }),
        animate('250ms ease-in', style({ opacity: '1', height: '*' })),
      ]),
      transition('* => void', [
        style({ opacity: '1', height: '*' }),
        animate('150ms ease-out', style({ opacity: '.7', height: '0', paddingBottom: '0' })),
      ]),
    ]),
  ]
})
export class LecturerTimetableComponent implements OnInit {

  @Input() id: string;

  calendar$: Observable<{
    week: Date,
    days: {
      day: Date,
      events: {
        name: string,
        type: 'lecturerTimetable',
        start: string,
        end: string,
        loc: string,
      }[]
    }[]
  }[]>;
  selectedWeeks = [];

  constructor(private ws: WsApiProvider) { }

  ngOnInit() {
    const options = { url: 'https://api.apiit.edu.my/lecturer-timetable/', auth: false };

    // January 5, 1970 00:00:00
    const lastDateOfWeekZero = new Date(318599999).getTime();

    this.calendar$ = this.ws.get<LecturerTimetable[]>(this.id, true, options).pipe(
      map(data => {
        let t = {} as any; // temporary Map for data processing
        data.forEach(d => {
          const since = new Date(d.since);

          // unique week - subtract from week zero and by 24 * 3600 * 1000 * 7
          const week = Math.ceil((since.getTime() - lastDateOfWeekZero) / 604800000);
          t[week] = t[week] || {};

          const day = since.getDay();
          t[week][day] = (t[week][day] || []).concat({
            type: 'lecturerTimetable',
            name: d.module,
            start: since,
            end: d.until,
            loc: `${d.room} @ ${d.location}`,
          });
        });

        return Object.keys(t).map(w => {
          const week = parseInt(w) * 604800000;
          return {
            week: new Date(week),
            days: Object.keys(t[w]).map(d => {
              return {
                day: new Date(week + parseInt(d) * 86400000),
                events: t[w][d]
              };
            })
          };
        });
      }),
      tap(w => this.selectedWeeks.push(w[0])),
    );
  }

  /** Display schedule. */
  show(week: any) {
    if (this.selectedWeeks.indexOf(week) === -1) {
      this.selectedWeeks.push(week);
    } else {
      this.selectedWeeks.splice(this.selectedWeeks.indexOf(week), 1);
    }
  }

}
