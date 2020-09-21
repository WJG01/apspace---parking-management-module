import { Pipe, PipeTransform } from '@angular/core';

import { APLCStudentBehaviour } from 'src/app/interfaces';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(students: APLCStudentBehaviour[], term: string): any {
    if (students.length === 0) {
      return;
    }
    return students.filter(student => student.STUDENT_NAME.toLowerCase().includes(term.toLowerCase())
      || student.STUDENT_NUMBER.toLowerCase().includes(term.toLowerCase()));
  }

}
