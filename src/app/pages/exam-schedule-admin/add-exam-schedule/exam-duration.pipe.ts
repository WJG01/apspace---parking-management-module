import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'examDuration'
})
export class ExamDurationPipe implements PipeTransform {

  transform(startDate: Date, endDate: Date): any {
    const seconds = Math.floor((+endDate - +startDate) / 1000);
    if (seconds < 29) {
      return 'Something is wrong, duration is less than 30 seconds';
    }


    const intervals = {
      hour: 3600,
      minute: 60,
      second: 1
    };

    let counter;
    for (const i of Object.keys(intervals)) {
      counter = Math.floor(seconds / intervals[i]);
      if (counter > 0) {
        if (counter === 1) {
          return  counter + ' ' + i ; // singular (in 1 hour )
        } else {
          return counter + ' ' + i + 's'; // plural (in 2 hours)
        }
      }
    }

  }
}
