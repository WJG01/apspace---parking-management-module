export class BeAPUStudentDetails {
  base64_photo: string;
  id: string;
  name: string;
}

export interface StudentPhoto {
  id: string;
  base64_photo: string;
}

export interface StudentSearch {
  STUDENT_NUMBER: string;
  NAME: string;
}
