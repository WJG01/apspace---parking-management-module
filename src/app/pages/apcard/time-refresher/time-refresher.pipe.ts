import { Pipe, PipeTransform } from '@angular/core';

import { DateWithTimezonePipe } from '../../../shared/date-with-timezone/date-with-timezone.pipe';

@Pipe({
  name: 'timeRefresher'
})
export class TimeRefresherPipe extends DateWithTimezonePipe implements PipeTransform {
  // TODO: Add DateTime Pipe Here
  transform(time: string, _: any): string {
    return super.transform(time, 'time');
  }
}
