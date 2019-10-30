import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-view-progress-report',
  templateUrl: './view-progress-report.page.html',
  styleUrls: ['./view-progress-report.page.scss'],
})
export class ViewProgressReportPage implements OnInit {
  stagingUrl = 'https://kh1rvo4ilf.execute-api.ap-southeast-1.amazonaws.com/dev/aplc';

  subjects$: Observable<any>; // to create interface
  classes$: Observable<any>; // to create interface
  scoreLegend$: Observable<any>; // to create interface
  descriptionLegend$: Observable<any>; // to create interface
  classDescription$: Observable<any>;
  studentsBehaviour$: Observable<any>;

  skeletons = new Array(6);
  subjectCode: string;
  classCode: string;

  constructor(
    private ws: WsApiService,
  ) { }

  ngOnInit() {
    this.initData();
  }

  initData() { // changed with refresher
    this.subjects$ = this.ws.get<any>(`/subjects`, { url: this.stagingUrl });
    this.scoreLegend$ = this.ws.get<any[]>(`/score-legend`, { url: this.stagingUrl, caching: 'cache-only' });
    this.descriptionLegend$ = this.ws.get<any[]>(`/description-legend`, { url: this.stagingUrl, caching: 'cache-only' });
  }

  onSubjectCodeChange() {
    this.classes$ = this.ws.get<any>(`/classes?subject_code=${this.subjectCode}`, { url: this.stagingUrl }).pipe(
      tap(_ => this.classCode = '')
    );
  }

  onClassCodeChange() {
    this.classDescription$ = this.ws.get<any>(`/class-description?class_code=${this.classCode}`, { url: this.stagingUrl });
    this.studentsBehaviour$ = this.ws.get<any>(`/student-behavior?class_code=${this.classCode}`, { url: this.stagingUrl });
  }

}
