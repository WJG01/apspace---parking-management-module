import { Pipe, PipeTransform } from '@angular/core';

import { HolidayColor } from '../../../interfaces';

@Pipe({
  name: 'monthColor'
})
export class MonthColorPipe implements PipeTransform {
  /**
   * Returns the correct color based on the months
   * @param startDate Start Date of Holiday
   * @param colors Array of colors for the year
   * @returns Colors value
   */
  transform(startDate: Date, colors: HolidayColor[]): string {
    const daysMonth = colors[new Date(startDate).getMonth()];
    // Fallback to primary color
    return daysMonth?.value || 'var(--ion-color-primary)';
  }
}
