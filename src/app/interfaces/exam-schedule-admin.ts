export interface ExamScheduleAdmin {
  ASSESSMENT_TYPE: string;
  CHECK_WEEK: number;
  DATEDAY: string;
  DATEDAYEND: string;
  QUESTION_RELEASE_DATE?: string | null;
  EXAM_TYPE: string;
  EXAMID: number;
  FROMDATE: string;
  MODULE_CODE: string;
  MODULE_NAME: string;
  REMARKS: string;
  RESULT_DATE: string;
  STATUS: string;
  TILLDATE: string;
  TIME: string;
  TIMESTAMP: string;
  VENUE: string;
  isChecked?: boolean;
}

export interface IntakeExamSchedule {
  DOCKETSDUE: string;
  ENTRYID: string;
  INTAKE: string;
  RESULT_DATE: string;
  TYPE: string;
  VENUE: string;
  isChecked?: boolean;
}

export interface ResitExamSchedule {
  APPRAISALSDUE: string;
  CHECK_WEEK: number;
  DATEDAY: string;
  DOCKETSDUE: string;
  INTAKE_GROUP: string;
  MODULE: string;
  STATUS: string;
  SUBJECT_DESCRIPTION: string;
  TIME: string;
  VENUE: string;
}


