export interface Attendance {
  COURSE_CODE: string;
  COURSE_DESCRIPTION: string;
  START_DATE: string;
  END_DATE: string;
  EXAM_ELIGIBILITY: string;
  MIN_CLASSES: number;
  MODULE_ATTENDANCE: string;
  NAME: string;
  PERCENTAGE: number;
  SEMESTER: number;
  STUDENT_NUMBER: string;
  SUBJECT_CODE: string;
  TOTAL_ABSENT: number;
  TOTAL_CLASSES: number;
  bankdraft_amount: number;
  RETAKE: boolean;
}

export interface AttendanceDetails {
  ATTENDANCE_STATUS: string;
  CLASS_DATE: string;
  CLASS_TYPE: string;
  TIME_FROM: string;
  TIME_TO: string;
}

export interface AttendanceLegend {
  '***': string;
  BA: string;
  BD: string;
  BF: string;
  Eligible: string;
  'N/A': string;
}

export interface MappedAttendance {
  semester: string;
  attendances: Attendance[];
}
