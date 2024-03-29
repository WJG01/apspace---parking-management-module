import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { MentorshipService } from '../../services';
import { MentorshipStudentList } from '../../interfaces';

@Component({
  selector: 'app-mentorship',
  templateUrl: './mentorship.page.html',
  styleUrls: ['./mentorship.page.scss'],
})
export class MentorshipPage {

  loadingSkeletons = Array(4);
  students$: Observable<MentorshipStudentList[]>;
  search = '';
  filter = '';

  constructor(
    private mentorship: MentorshipService
  ) { }

  ionViewDidEnter() {
    this.students$ = this.mentorship.getStudents();
  }

}
