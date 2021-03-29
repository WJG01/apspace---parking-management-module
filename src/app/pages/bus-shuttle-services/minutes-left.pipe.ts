import { Pipe, PipeTransform } from '@angular/core';
import {parse} from 'date-fns';

@Pipe({
  name: 'minutesLeft'
})
export class MinutesLeftPipe implements PipeTransform {

  transform(value: string ): any {
    let parsedTime = null;

    if (value.includes('AM') || value.includes('PM')) {
      parsedTime = parse(value, 'hh:mm aa', new Date());
    } else {
      parsedTime = parse(value, 'HH:mm', new Date());
    }

    if (parsedTime) {
      const seconds = Math.floor((+parsedTime - +new Date()) / 1000);
      if (seconds < 29) { // less than 30 seconds ago will show as 'Just now'
        return 'Just now';
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
            return 'in' + ' ' + counter + ' ' + i + '' + ' ' + '(' + value + ')' ; // singular (in 1 hour )
          } else {
            return 'in' + ' ' + counter + ' ' + i + 's' + ' ' + '(' + value + ')' ; // plural (in 2 hours)
          }
        }
      }
    }
    return value;
  }

}
