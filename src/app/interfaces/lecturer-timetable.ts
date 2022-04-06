export interface LecturerTimetable {
  module: string;
  intakes: string[];
  time: string;
  duration: number;
  location: string;
  room: string;
}

export interface MappedLecturerTimetable {
  week: Date;
  timetables: FormattedLecturerTimetable[]
}

export interface FormattedLecturerTimetable {
  type: string;
  module: string;
  start: Date;
  end: number;
  location: string;
  intakes: string[];
}

export interface FormattedDaysLecturerTimetable {
  day: string;
  schedule: FormattedLecturerTimetable[];
}
