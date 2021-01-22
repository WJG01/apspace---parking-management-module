import { Pipe, PipeTransform } from '@angular/core';
// import { format } from 'date-fns';

@Pipe({
  name: 'formattedDate'
})
export class FormattedDatePipe implements PipeTransform {

  transform(date: any): any {
    const dateArray = date.split(' ');
    return new Date(dateArray[0] + 'T' + dateArray[1]);
  }
}
