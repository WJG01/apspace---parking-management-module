export interface NewFeedbackSummary {
    id: number;
    category_id: string;
    subject: string;
    datetime: string;
    issue_id: string;
}
interface Comments{
    comment_c: string;
    datetime: string;
    username: string[];
}
export interface NewFeedback {
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

export interface NewFeedbackComment {
    message: string;
}
