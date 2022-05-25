import { Pipe, PipeTransform } from '@angular/core';
import { StudentTimetable } from 'src/app/interfaces';

/**
 * Filter timetable by location.
 */
@Pipe({
  name: 'byLocation'
})
export class ByLocationPipe implements PipeTransform {

  /**
   * Filter timetable based on location.
   *
   * @param timetables - array of timetable
   * @param location - location to be filtered
   * @returns rooms - filtered timetables
   */
  transform(timetables: StudentTimetable[] | null, location: string): StudentTimetable[] {
    return (timetables || []).filter(timetable => timetable.LOCATION === location);
  }
}
