import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Mentorship } from 'src/app/interfaces/mentorship';
import { MentorshipService } from 'src/app/services/mentorship.service';

@Component({
  selector: 'app-mentorship',
  templateUrl: './mentorship.page.html',
  styleUrls: ['./mentorship.page.scss'],
})
export class MentorshipPage {

  loadingSkeletons = Array(4);
  search = '';
  students$: Observable<Mentorship[]>;

  options: Fuse.FuseOptions<Mentorship> = {
    keys: ['INTAKE_CODE', 'NAME', 'PROGRAMME', 'STUDENT_NUMBER']
  };

  constructor(
    private mentorship: MentorshipService
  ) { }

  ionViewDidEnter() {
    this.students$ = this.mentorship.getStudents();
  }

}
