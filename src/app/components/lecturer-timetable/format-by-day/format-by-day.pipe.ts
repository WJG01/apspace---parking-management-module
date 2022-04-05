import { Pipe, PipeTransform } from '@angular/core';

import { format } from 'date-fns';

import { FormattedDaysLecturerTimetable, FormattedLecturerTimetable } from '../../../interfaces';

/** Format Array based on days (ex Monday, Tuesday...) */
@Pipe({
  name: 'formatByDay'
})
export class FormatByDayPipe implements PipeTransform {

  transform(timetables: FormattedLecturerTimetable[]): FormattedDaysLecturerTimetable[] {
    const timetablePerDay = timetables.reduce((previous: any, current: any) => {
      const day = format(current.start, 'EEEE');

      if (!previous[day]) {
        previous[day] = [current];
      } else {
        previous[day].push(current);
      }
      return previous;
    }, {});
    return Object.keys(timetablePerDay).map(day => ({ day, schedule: timetablePerDay[day] }));
  }
}
