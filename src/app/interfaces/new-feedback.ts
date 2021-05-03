export interface NewFeedbackSummary {
    id: number;
    category_id: string;
    subject: string;
    datetime: string;
    issue_id: string;
}

<<<<<<< HEAD
interface Comments{
    comment_c: string;
    datetime: string;
    username: string[];
}

=======
>>>>>>> feat: added features for feedback sys
export interface NewFeedback {
    feedback_id: number;
    issue_id: string;
    subject: string;
<<<<<<< HEAD
    comments: Comments[];
=======
    comments: {comment_c: string;
               datetime: string;
               username: string}[];
>>>>>>> feat: added features for feedback sys
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
