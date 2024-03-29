import { Pipe, PipeTransform } from '@angular/core';

import { MentorshipStudentList } from 'src/app/interfaces';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(results: MentorshipStudentList[], filter: string): MentorshipStudentList[] {
    if (!filter) {
      return results;
    } else {
      return results.filter(
        r => r.RELATIONTYPE.toLocaleLowerCase() === filter.toLocaleLowerCase()
      );
    }
  }
}
