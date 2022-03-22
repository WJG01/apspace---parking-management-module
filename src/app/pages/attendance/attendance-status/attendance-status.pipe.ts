import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'attendanceStatus'
})
export class AttendanceStatusPipe implements PipeTransform {
/**
 *
 * @param status attendance status (ex: Y)
 * @param isClassName if true css class name is returned else status value
 * @returns string value with proper value
 */
  transform(status: string, isClassName: boolean): string {
    const attendanceClass = {
      ['Y']: 'attended',
      ['N']: 'absent',
      ['R']: 'absent-reason',
      ['L']: 'late'
    };

    const attendanceStatusName = {
      ['Y']: 'Present',
      ['N']: 'Absent',
      ['R']: 'Absent w/ Reason',
      ['L']: 'Late'
    };

    if (isClassName) {
      return attendanceClass[status];
    }
    return attendanceStatusName[status];
  }
}
