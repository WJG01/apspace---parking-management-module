export interface NewFeedbackSummary {
    id: number;
    category_id: string;
    subject: string;
    datetime: string;
    issue_id: string;
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> fix: made requested changes
interface Comments{
    comment_c: string;
    datetime: string;
    username: string[];
}

<<<<<<< HEAD
=======
>>>>>>> feat: added features for feedback sys
=======
>>>>>>> fix: made requested changes
export interface NewFeedback {
    feedback_id: number;
    issue_id: string;
    subject: string;
<<<<<<< HEAD
<<<<<<< HEAD
    comments: Comments[];
=======
    comments: {comment_c: string;
               datetime: string;
               username: string}[];
>>>>>>> feat: added features for feedback sys
=======
    comments: Comments[];
>>>>>>> fix: made requested changes
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
