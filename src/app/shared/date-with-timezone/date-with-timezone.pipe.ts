import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { ConfigurationsService } from '../../services';

@Pipe({
  name: 'dateWithTimezone'
})
export class DateWithTimezonePipe implements PipeTransform {

  enableMalaysiaTimezone: boolean;
  timeFormat: string;

  constructor(private config: ConfigurationsService) {
    this.enableMalaysiaTimezone = this.config.getMockSettings().enableMalaysiaTimezone;
  }

  transform(date: any, format: string, _ = false) {
    const timezone = this.enableMalaysiaTimezone ? '' : '+0800';
    let newFormat = '';

    if (format === 'time' || format === 'bus') {
      this.timeFormat = this.config.getMockSettings().timeFormat;

      this.timeFormat === '24' ? newFormat = 'HH:mm (zzz)' : newFormat = 'hh:mm aa (zzz)';
    } else {
      newFormat = format;
    }

    if (format === 'bus') {
      return new DatePipe('en-US').transform(date, newFormat, '');
    }
    return new DatePipe('en-US').transform(date, newFormat, timezone);
  }
}
