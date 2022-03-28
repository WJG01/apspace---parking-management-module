export interface ExamSchedule {
  examType: string;
  intake: string;
  module: string;
  subjectDescription: string;
  venue: string;
  since: string;
  until: string;
  docketsDue: string;
  endDate: string;
  appraisalsDue: string | null;
  resultDate: string | null;
  assessmentType?: string | null;
  duration?: string | null;
  questionReleaseDate?: string | null;
}
