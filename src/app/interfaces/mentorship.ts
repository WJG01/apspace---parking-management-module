export interface MentorshipStudentList {
    INTAKE_CODE: string;
    NTAKE_END_DATE: string;
    NAME: string;
    PROGRAMME: string;
    STUDENT_NUMBER: string;
    RELATIONTYPE: string;
}

export interface MentorshipIntake {
    COURSE_DESCRIPTION: string;
    INTAKE_CODE: string;
    OVERALL_CLASSIFICATION: string;
    STUDENT_NUMBER: string;
    STUDY_MODE: string;
}

export interface MentorshipCourseDetail {
    AVERAGE_GRADE: string;
    AVERAGE_MARKS: number;
    MODERATED_GRADES: number;
    MODERATED_MARKS: number;
    OVERALL_MARKS: number;
    PREVIOUS_COURSE_OVERALL: number;
    PUBLISH_RESULTS: number;
    REMARKS: string;
    STUDENT_NUMBER: string;
}

export interface MentorshipSubcourse {
    CREDIT_HOURS: string;
    GRADE_POINT: string;
    INTAKE_CODE: string;
    MODULE_CODE: string;
    MODULE_NAME: string;
    RESULT: string;
    SEMESTER: number;
    STUDENT_NUMBER: string;
    TOTAL_ATTEND_PERCENT: number;
    TOTAL_CLASS: number;
}

export interface MentorshipAttendance {
    ABSENT_REASON: string;
    ATTENDANCE_STATUS: string;
    CLASS_CODE: string;
    CLASS_DATE: string;
    CLASS_TYPE: string;
    DATE_MARKED: string;
    DATE_MODIFIED: string;
    MARKED_BY: string;
    MODIFIED_BY: string;
    STUDENT_CLASS_STATUS: string;
    STUDENT_NUMBER: string;
    TIME_FROM: string;
    TIME_TO: string;
}

export interface MentorshipResult {
    ACTUAL_MARKS: number;
    ASSESMENT_CODE: string;
    ASSESMENT_TYPE: string;
    EXAM_CODE: string;
    EXAM_DATE: string;
    EXAM_STATUS: string;
    GRADE: string;
    INTAKE_CODE: string;
    MARKS: number;
    STUDENT_NUMBER: string;
    SUBJECT_CODE: string;
}

export interface MentorshipSemesterSummary {
    CREDIT_TRANSFERRED: number;
    GPA: number;
    IMMIGRATION_GPA: number;
    SEMESTER: number;
    SEMESTER_ATTENDANCE: number;
    TOTAL_CREDIT_HOURS: number;
    TOTAL_MODULES_PASSED: number;
}

export interface StudentRemark {
  RECORDED_BY: string;
  REMARKS: string;
  REMARKS_DATE: string;
  SAMACCOUNTNAME: string;
  CAN_EDIT: boolean;
}
