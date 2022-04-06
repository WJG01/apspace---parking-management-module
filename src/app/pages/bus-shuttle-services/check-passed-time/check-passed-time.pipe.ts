import { Pipe, PipeTransform } from '@angular/core';

import { parse } from 'date-fns';

import { ConfigurationsService } from '../../../services';
import { DateWithTimezonePipe } from '../../../shared/date-with-timezone/date-with-timezone.pipe';

@Pipe({
  name: 'checkPassedTime'
})
export class CheckPassedTimePipe implements PipeTransform {

  constructor(
    private config: ConfigurationsService,
    private dateWithTimezonePipe: DateWithTimezonePipe
  ) { }

  transform(passedTime: string): boolean {
    const currentTime = this.dateWithTimezonePipe.transform(new Date(), 'HH:mm');
    const timeFormat = this.config.getMockSettings().timeFormat;

    if (timeFormat === '12') {
      const timeObject = parse(passedTime.slice(0, -8), 'h:mm aa', new Date());
      const formattedPassedTime = this.dateWithTimezonePipe.transform(timeObject, 'HH:mm');

      return currentTime >= formattedPassedTime;
    } else {
      return currentTime >= passedTime;
    }
  }
}
