import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slots'
})
export class FilterSlotsPipe implements PipeTransform {
  // TODO: Define proper type
  transform(dates: {}, selectedDate: string) {
    if (dates && selectedDate) {
      return dates[selectedDate];
    }

    return dates;
  }
}
