export interface DmuFormContent {
    content: string;
    valid_from: Date;
    valid_to: Date;
    enforcement_status: number;
    enforcement_from: number;
    enforcement_date: Date;
    checkbox_content: string;
}

export interface DmuFormRegistration {
    student_id: string;
    submitted_by: string;
    submitted_date: Date;
}
