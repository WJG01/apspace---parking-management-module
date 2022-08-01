import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormatter'
})
export class TimeFormatterPipe implements PipeTransform {

  transform(value: any): any {
    let time = value.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [value];

    if (time.length > 1) {
      time = time.slice(1);
      time[3] = ''; // We do not need seconds
      time[4] = +time[0] < 12 ? ' AM' : ' PM';
      time[0] = +time[0] % 12 || 12;
    }

    return time.join('');
  }

}
