export interface AnonymousFeedbackSummary {
  id: number;
  category_id: string;
  subject: string;
  datetime: string;
  issue_id: string;
  is_anon: boolean | null;
}

interface Comments {
  comment_c: string;
  datetime: string;
  username: string;
}

export interface AnonymousFeedback {
  feedback_id: number;
  issue_id: string;
  subject: string;
  comments: Comments[];
  message: string[];
  status: string;
}

export interface FeedbackCategory {
  id: number;
  name: string;
}

export interface AnonymousFeedbackComment {
  message: string;
}
