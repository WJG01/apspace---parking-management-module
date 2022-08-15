import { Pipe, PipeTransform } from '@angular/core';

import { add } from 'date-fns';

import { ConsultationSlot } from '../../../../../interfaces';
import { DateWithTimezonePipe } from '../../../../../shared/date-with-timezone/date-with-timezone.pipe';

@Pipe({
  name: 'validateCheckbox'
})
export class ValidateCheckboxPipe implements PipeTransform {

  constructor(private dateWithTimezonePipe: DateWithTimezonePipe) { }

  transform(slot: ConsultationSlot): boolean {
    return new Date(this.dateWithTimezonePipe.transform(slot.start_time, 'medium'))
      > add(new Date(), { hours: 24 });
  }
}
