import { Pipe, PipeTransform } from '@angular/core';

import { MappedSlots } from '../../../../../interfaces';

@Pipe({
  name: 'slots'
})
export class FilterSlotsPipe implements PipeTransform {

  transform(dates: MappedSlots[], selectedDate: string): MappedSlots {
    return dates.find(d => d.date === selectedDate);
  }
}
