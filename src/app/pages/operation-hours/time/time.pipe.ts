import { Pipe, PipeTransform } from '@angular/core';

import { parse } from 'date-fns';

import { DateWithTimezonePipe } from '../../../shared/date-with-timezone/date-with-timezone.pipe';

@Pipe({
  name: 'time'
})
export class TimePipe extends DateWithTimezonePipe implements PipeTransform {

  transform(value: string | number): string {
    let time = value.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [value];
    if (time.length > 1) {
      time = time.slice(1);
      time[3] = ''; // We don't need seconds
      time[4] = +time[0] < 12 ? ' AM' : ' PM';
      time[0] = +time[0] % 12 || 12;
    }

    const timeObject = parse(time.join(''), 'hh:mm aa', new Date());

    return super.transform(timeObject, 'time');
  }
}
