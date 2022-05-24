import { Pipe, PipeTransform } from '@angular/core';
import { parse } from 'date-fns';

import { DateWithTimezonePipe } from 'src/app/shared/date-with-timezone/date-with-timezone.pipe';

@Pipe({
  name: 'timeParser',
})
export class TimeParserPipe extends DateWithTimezonePipe implements PipeTransform {

  transform(time: string, _: any, withDate = false): string {
    if (!withDate) {
      const timeObject = parse(time, 'h:mm aa', new Date());
      return <string> super.transform(timeObject, 'time');
    } else {
      // tslint:disable-next-line: quotemark
      const timeObject = parse(time, "yyyy-MM-dd'T'HH:mm:ssXXX", new Date());
      return <string> super.transform(timeObject, 'time');
    }
  }
}

