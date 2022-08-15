import { Pipe, PipeTransform } from '@angular/core';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

@Pipe({
  name: 'examDuration'
})
export class ExamDurationPipe implements PipeTransform {

  transform(startDate: Date, endDate: Date): any {
    // check if date is too small to avoid negative values
    const seconds = Math.floor((+endDate - +startDate) / 1000);
    if (seconds < 29) {
      return 'Something is wrong, duration is less than 30 seconds';
    }

    let duration = '';
    const days = differenceInDays(endDate, startDate);
    let hours = differenceInHours(endDate, startDate);
    let minutes = differenceInMinutes(endDate, startDate);

    if (days) {
      hours -= 24 * days;
      minutes -= 1440 * days;
      duration += days > 1 ? `${days} days` : `${days} day`;
    }

    if (hours) {
      minutes -= 60 * hours;
      if (days) {
        duration += hours > 1 ? `, ${hours} hours` : `, ${hours} hour`;
      } else {
        duration += hours > 1 ? `${hours} hours` : `${hours} hour`;
      }
    }

    if (minutes) {

      if (days || hours) {
        duration += minutes > 1 ? `, ${minutes} minutes` : `, ${minutes} minute`;
      } else {
        duration += minutes > 1 ? `${minutes} minutes` : `${minutes} minute`;
      }
    }

    if (duration.length > 0) {
      return duration;
    }
  }

}
