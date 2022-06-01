import { Pipe, PipeTransform } from '@angular/core';

import { ClassroomTypes } from '../../../constants';
import { StudentTimetable } from '../../../interfaces';

/**
 * Filter timetable based on room.
 */
@Pipe({
  name: 'byRooms'
})
export class ByRoomsPipe implements PipeTransform {

  static readonly typeMap = ClassroomTypes.reduce((acc, { key, value }) => (acc[key] = value, acc), {});

  /**
   * Filter timetable based on type of room.
   *
   * @param timetables - array of timetable
   * @param types - type of room to filter
   * @returns rooms - filtered timetables
   */
  transform(timetables: StudentTimetable[], types: string[]): StudentTimetable[] {
    if (types.length === Object.keys(ByRoomsPipe.typeMap).length) {
      return timetables;
    } else {
      const fullTypes = [].concat(...types.map(t => ByRoomsPipe.typeMap[t]));
      return timetables.filter(timetable => fullTypes.some(t => timetable.ROOM.includes(t)));
    }
  }
}
