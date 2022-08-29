import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { MentorshipRelationType, MentorshipStudentList } from 'src/app/interfaces/mentorship';
import { MentorshipService } from 'src/app/services/mentorship.service';

@Component({
  selector: 'app-mentorship',
  templateUrl: './mentorship.page.html',
  styleUrls: ['./mentorship.page.scss'],
})
export class MentorshipPage {

  loadingSkeletons = Array(4);
  students$: Observable<MentorshipStudentList[]>;
  relationType$: Observable<MentorshipRelationType[]>;
  search = '';
  filter = '';

  constructor(
    private mentorship: MentorshipService
  ) { }

  ionViewDidEnter() {
    this.students$ = this.mentorship.getStudents();
    this.relationType$ = this.mentorship.getRelationType();
  }
}
