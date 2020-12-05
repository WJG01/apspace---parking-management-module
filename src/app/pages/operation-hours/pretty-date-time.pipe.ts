import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  name: 'prettyDate'
})
export class PrettyDateTimePipe implements PipeTransform {

  transform(value: Date): string {
    return format(new Date(value), 'dd MMM HH:mm');
  }
}


