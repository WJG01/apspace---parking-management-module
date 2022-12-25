export interface AttendixClass {
  DATE: string;
  TIME_FROM: string;
  TIME_TO: string;
  TYPE: string;
  TOTAL: {
    PRESENT: number;
    LATE: number;
    ABSENT: number;
    ABSENT_REASON: number;
  };
}

export interface Classcode {
  CLASS_CODE: string;
  SUBJECT_CODE: string;
  LECTURER_CODE: string;
  COURSE_CODE_ALIAS: string;
  CLASSES: AttendixClass[];
}

export interface Classcodev1 {
  CLASS_CODE: string;
  SUBJECT_CODE: string;
  LECTURER_CODE: string;
  COURSE_CODE_ALIASES: string[];
  CLASSES: AttendixClass[];
}

export interface FlatClasscode {
  CLASS_CODE: string;
  SUBJECT_CODE: string;
  LECTURER_CODE: string;
  COURSE_CODE_ALIASES: string;
  DATE: string;
  TIME_FROM: string;
  TIME_TO: string;
  TYPE: string;
  TOTAL: {
    PRESENT: number;
    LATE: number;
    ABSENT: number;
    ABSENT_REASON: number;
  };
}

export interface AttendanceSummary {
  labels: string[];
  datasets: AttendanceSummaryDataset[];
};

interface AttendanceSummaryDataset {
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

export interface AttendanceIntegrityClasses {
  classCode: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  total: number;
  type: string;
  checked: boolean;
}
