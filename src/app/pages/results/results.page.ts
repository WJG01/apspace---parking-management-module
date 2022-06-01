import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { catchError, finalize, forkJoin, map, Observable, switchMap, tap } from 'rxjs';

import { Storage } from '@ionic/storage-angular';
import { ChartData, ChartOptions } from 'chart.js';

import { ClassificationLegend, Course, CourseDetails, DeterminationLegend, InterimLegend, MPULegend, Role, StudentProfile, StudentSearch, Subcourse, StudentPhoto, BeAPUStudentDetails } from '../../interfaces';
import { CasTicketService, ComponentService, WsApiService } from '../../services';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {

  course$: Observable<Course[]>;
  results$: Observable<{ semester: string; summary?: CourseDetails[]; value: Subcourse[]; }[]>;
  courseDetail$: Observable<CourseDetails[]>;
  interimLegend$: Observable<InterimLegend[]>;
  mpuLegend$: Observable<MPULegend[]>;
  determinationLegend$: Observable<DeterminationLegend[]>;
  classificationLegend$: Observable<ClassificationLegend[]>;
  studentProfile: StudentProfile;
  photo$: Observable<StudentPhoto>;
  loading: HTMLIonLoadingElement;

  // Chart Configs
  summaryChart: {
    options: ChartOptions,
    data: ChartData
  } = {
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        responsive: true,
        aspectRatio: 2
      },
      data: null
    };
  noSummary = true;
  selectedIntake: string;
  intakeLabels: any;
  block = true;
  message: string;

  // used for GIMS Web Results - for Staff
  prodUrl = 'https://api.apiit.edu.my/student';
  searchKeyword = '';
  searchResults = '';
  selectedStudentId = '';

  skeletons = new Array(5);
  staffRole: boolean;
  showResults: boolean;
  studentSelected: boolean;
  intakeSelected: boolean;
  unauthorised = false;

  studentsList$: Observable<any>;
  studentProfile$: Observable<StudentProfile>;
  studentDetails$: Observable<BeAPUStudentDetails[]>;
  studentCourses$: Observable<Course[]>;
  studentsResults$: Observable<{ semester: string; value: Subcourse[]; }[]>;

  constructor(
    private ws: WsApiService,
    private cas: CasTicketService,
    private http: HttpClient,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private storage: Storage,
    private component: ComponentService,
    private router: Router
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(refresher?: any) {
    const caching = refresher ? 'network-or-cache' : 'cache-only';
    this.storage.get('canAccessResults').then(canAccessResults => {
      if (canAccessResults) {
        this.staffRole = true;
      } else {
        this.storage.get('role').then((role: Role) => {
          // tslint:disable-next-line: no-bitwise
          if (role & Role.Student) {
            this.getDetailsForStudents(caching, refresher);
          } else {
            this.unauthorised = true;
          }
        });
      }
    });
  }

  getDetailsForStudents(caching: 'network-or-cache' | 'cache-only', refresher) {
    this.photo$ = this.ws.get<StudentPhoto>('/student/photo', { caching });
    this.ws.get<StudentProfile>('/student/profile', { caching }).subscribe(p => {
      this.studentProfile = p;
      if (p.BLOCK) {
        this.block = true;
        this.course$ = this.ws.get<Course[]>('/student/courses', { caching }).pipe(
          tap(i => this.selectedIntake = i[0].INTAKE_CODE),
          tap(i => this.results$ = this.getResults(i[0].INTAKE_CODE, { caching })),
          tap(i => this.getCourseDetails(i[0].INTAKE_CODE, { caching })),
          tap(i => this.getMpuLegend(i[0].INTAKE_CODE, { caching })),
          tap(i => this.getDeterminationLegend(i[0].INTAKE_CODE, { caching })),
          tap(i => this.getClassificatinLegend(i[0].INTAKE_CODE, { caching })),
          tap(i => this.intakeLabels = Array.from(new Set((i || []).map(t => t.INTAKE_CODE)))),
          finalize(() => refresher && refresher.target.complete())
        );
      } else {
        this.block = false;
        this.message = p.MESSAGE;
      }
    });
  }

  intakeChanged() {
    this.results$ = this.getResults(this.selectedIntake, { caching: 'network-or-cache' });
    this.getCourseDetails(this.selectedIntake, { caching: 'network-or-cache' });
  }

  openSurvey() {
    this.router.navigateByUrl('/student-survey');
  }

  async generateInterimPDF() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 5000
    });
    await loading.present();

    return forkJoin([
      this.requestInterimST(this.selectedStudentId, this.selectedIntake),
    ]).pipe(
      map(([serviceTickets]) => {
        const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
        // tslint:disable-next-line: max-line-length
        return this.http.post<any>('https://api.apiit.edu.my/interim-transcript/index.php', serviceTickets, { headers, responseType: 'text' as 'json' }).subscribe((response: string) => {
          catchError(err => {
            this.component.toastMessage(`Failed to generate: ${err.message}`, 'danger');
            return err;
          });

          if (response.startsWith('https://')) { // Only respond and do things if the response is a URL
            loading.dismiss();
            this.component.openLink(response);
          } else {
            loading.dismiss();
            this.component.toastMessage('Oops! Unable to generate PDF', 'danger');
          }
        });
      })
    ).subscribe();
  }

  requestInterimST(studentId: string, intakeCode: string) {
    const studentIdParam = studentId ? `?id=${studentId}` : '';

    return forkJoin([
      this.cas.getST(`${this.prodUrl}/courses${studentIdParam}`),
      this.cas.getST(`${this.prodUrl}/subcourses`),
      this.cas.getST(`${this.prodUrl}/interim_legend`),
      this.cas.getST(`${this.prodUrl}/sub_and_course_details`),
      this.cas.getST(`${this.prodUrl}/profile${studentIdParam}`),
      this.cas.getST(`${this.prodUrl}/mpu_legend`),
      this.cas.getST(`${this.prodUrl}/classification_legend`),
      this.cas.getST(`${this.prodUrl}/su_legend`),
      this.cas.getST(`${this.prodUrl}/determination_legend`)
    ]).pipe(
      // tslint:disable-next-line: variable-name && tslint:disable-next-line: max-line-length
      map(([coursesST, subcoursesST, interim_legendST, sub_and_course_detailsST, profileST, mpu_legendST, classification_legendST, su_legendST, determination_legendST]) => {
        const payload = {
          intake: intakeCode,
          id: studentId,
          tickets: {
            courses: coursesST,
            subcourses: subcoursesST,
            interim_legend: interim_legendST,
            sub_and_course_details: sub_and_course_detailsST,
            profile: profileST,
            mpu_legend: mpu_legendST,
            classification_legend: classification_legendST,
            su_legend: su_legendST,
            determination_legend: determination_legendST,
          }
        };

        return payload;
      })
    );
  }

  getResults(
    intake: string,
    options: { caching: 'network-or-cache' | 'cache-only' }, student?: StudentSearch
  ): Observable<{ semester: string; value: Subcourse[] }[]> {
    const withSearch = student ? `&id=${student.STUDENT_NUMBER}` : '';
    const url = `/student/subcourses?intake=${intake}${withSearch}`;

    return this.results$ = forkJoin([
      this.ws.get<Subcourse>(url),
      this.getCourseDetails(intake, { caching: 'network-or-cache' }, student)
    ]).pipe(
      tap(([results]) => this.getInterimLegend(intake, results, options, student)),
      map(([results, details]) => this.sortResult(results, details))
    );
  }

  sortResult(results: any, courseSummary: any) {
    const resultBySemester = results
      .reduce((previous: any, current: any) => {
        if (!previous[current.SEMESTER]) {
          previous[current.SEMESTER] = [current];
        } else {
          previous[current.SEMESTER].push(current);
        }
        return previous;
      }, {});

    const summaryBySemester = courseSummary.reduce(
      (acc: any, result: any) => (
        (acc[result.SEMESTER] = (acc[result.SEMESTER] || []).concat(result)),
        acc
      ),
      {}
    );

    return Object.keys(resultBySemester).map(semester => ({
      semester,
      value: resultBySemester[semester] || [],
      summary: summaryBySemester[semester] || []
    }));
  }

  openSurveyPage(moduleCode: string) {
    const navigationExtras: NavigationExtras = {
      state: { moduleCode, intakeCode: this.selectedIntake }
    };
    this.navCtrl.navigateForward(['/student-survey'], navigationExtras);
  }

  // tslint:disable-next-line: max-line-length
  getCourseDetails(intake: string, options: { caching: 'network-or-cache' | 'cache-only' }, student?: StudentSearch): Observable<CourseDetails[]> {
    const studentId = student ? `&id=${student.STUDENT_NUMBER}` : '';
    const url = `/student/sub_and_course_details?intake=${intake}${studentId}`;
    return this.courseDetail$ = this.ws.get<CourseDetails[]>(url, options);
  }

  getInterimLegend(intake: string, results: any, options: { caching: 'network-or-cache' | 'cache-only' }, student?: StudentSearch) {
    const withSearch = student ? `&id=${student.STUDENT_NUMBER}` : '';
    const url = `/student/interim_legend?intake=${intake}${withSearch}`;
    this.interimLegend$ = this.ws.get<InterimLegend[]>(url, options).pipe(
      tap(res => {
        const gradeList = Array.from(new Set((res || []).map(grade => grade.GRADE)));
        this.sortGrades(results, gradeList);
      }),
    );
  }

  getMpuLegend(intake: string, options: { caching: 'network-or-cache' | 'cache-only' }, student?: StudentSearch) {
    const withSearch = student ? `&id=${student.STUDENT_NUMBER}` : '';
    const url = `/student/mpu_legend?intake=${intake}${withSearch}`;
    this.mpuLegend$ = this.ws.get<MPULegend[]>(url, options);
  }

  getDeterminationLegend(intake: string, options: { caching: 'network-or-cache' | 'cache-only' }, student?: StudentSearch) {
    const withSearch = student ? `&id=${student.STUDENT_NUMBER}` : '';
    const url = `/student/determination_legend?intake=${intake}${withSearch}`;
    this.determinationLegend$ = this.ws.get<DeterminationLegend[]>(url, options);
  }

  getClassificatinLegend(intake: string, options: { caching: 'network-or-cache' | 'cache-only' }, student?: StudentSearch) {
    const withSearch = student ? `&id=${student.STUDENT_NUMBER}` : '';
    const url = `/student/classification_legend?intake=${intake}${withSearch}`;
    this.classificationLegend$ = this.ws.get<ClassificationLegend[]>(url, options);
  }

  sortGrades(results: any, gradeList: any) {
    const gradeCounter: { [index: string]: number } = results
      .map(r => r.GRADE)
      .reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      }, {});

    const studentResults = Object.keys(gradeCounter)
      .filter(g => g.length <= 2)
      .sort((a, b) => gradeList.indexOf(a) - gradeList.indexOf(b))
      .map(k => ({ grade: k, count: gradeCounter[k] }));
    const grades = studentResults.map(r => r.grade);
    const count = studentResults.map(r => r.count);
    if (grades.length > 0) {
      // Grades sometimes does not sort properly
      const sortedGrades = grades.sort((a, b) => {
        const order = { '+': -1, '-': 1, undefined: 0 };

        return a[0].localeCompare(b[0]) || order[a[1]] - order[b[1]];
      });
      this.showBarChart(sortedGrades, count);
      this.noSummary = false;
    }
  }

  showBarChart(listItems: string[], listCount: number[]) {
    const randomColor = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(54,72,87,0.7)',
      'rgba(247,89,64,0.7)',
      'rgba(61,199,190,0.7)',
    ];

    const randomBorderColor = [
      'rgba(255,99,132,1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(54,72,87,1)',
      'rgba(247,89,64,1)',
      'rgba(61,199,190,1)',
    ];

    this.summaryChart.data = {
      datasets: [{
        backgroundColor: randomColor,
        borderColor: randomBorderColor,
        borderWidth: 2,
        data: listCount,
        hoverBackgroundColor: randomBorderColor,
        hoverBorderColor: ''
      }],
      labels: listItems
    }
  }

  trackByFn(index: number) {
    return index;
  }

  searchForStudents() {
    this.showResults = true;
    this.studentSelected = false;
    this.intakeSelected = false;
    this.searchResults = this.searchKeyword; // used for the error message
    // we need to get st for the service including the params (?id=)
    this.studentsList$ = this.cas.getST(`${this.prodUrl}/search?id=${this.searchKeyword}`).pipe(
      switchMap((st) => {
        return this.ws.get<StudentSearch[]>(`/students/search?id=${this.searchKeyword}&ticket=${st}`,
          { auth: false, attempts: 1 }
        );
      })
    ).pipe(
      tap(studentsList => {
        if (studentsList.length === 1) {
          this.getStudentProfile(studentsList[0]);
          this.getStudentCourses(studentsList[0]);
          this.studentSelected = true;
        }
      })
    );
  }

  getStudentData(student: StudentSearch) {
    this.intakeSelected = false;
    this.studentSelected = true;
    this.getStudentProfile(student);
    this.getStudentCourses(student);
  }

  getStudentProfile(student: StudentSearch) {
    // we need to get st for the service including the params (?id=)
    this.studentProfile$ = this.cas.getST(`${this.prodUrl}/profile?id=${student.STUDENT_NUMBER}`).pipe(
      switchMap((st) => {
        return this.ws.get<StudentProfile>(`/profile?id=${student.STUDENT_NUMBER}&ticket=${st}`,
          { url: this.prodUrl, auth: false, attempts: 1 }
        );
      })
    );

    this.studentDetails$ = this.ws.post<BeAPUStudentDetails[]>('/student/image', {
      body: {
        id: [student.STUDENT_NUMBER]
      }
    });
  }

  getStudentCourses(student: StudentSearch) {
    // we need to get st for the service including the params (?id=)
    this.studentCourses$ = this.cas.getST(`${this.prodUrl}/courses?id=${student.STUDENT_NUMBER}`).pipe(
      switchMap((st) => {
        return this.ws.get<any>(`/courses?id=${student.STUDENT_NUMBER}&ticket=${st}`,
          { url: this.prodUrl, auth: false, attempts: 1 }
        ).pipe(
          tap(i => this.selectedIntake = i[0].INTAKE_CODE),
          tap(i => this.results$ = this.getResults(i[0].INTAKE_CODE, { caching: 'network-or-cache' }, student)),
          tap(i => this.getCourseDetails(i[0].INTAKE_CODE, { caching: 'network-or-cache' }, student)),
          tap(i => this.getMpuLegend(i[0].INTAKE_CODE, { caching: 'network-or-cache' }, student)),
          tap(i => this.getDeterminationLegend(i[0].INTAKE_CODE, { caching: 'network-or-cache' }, student)),
          tap(i => this.getClassificatinLegend(i[0].INTAKE_CODE, { caching: 'network-or-cache' }, student)),
          tap(_ => {
            this.intakeSelected = true;
            this.studentSelected = true;
            this.selectedStudentId = student.STUDENT_NUMBER;
          })
        );
      })
    );
  }

  getStudentResultsForStaff(student: StudentSearch, intake: string) {
    this.intakeSelected = true;
    this.studentSelected = true;
    this.selectedStudentId = student.STUDENT_NUMBER;
    this.selectedIntake = intake;
    this.results$ = this.getResults(this.selectedIntake, { caching: 'network-or-cache' }, student);

    this.getMpuLegend(intake, { caching: 'network-or-cache' }, student);
    this.getDeterminationLegend(intake, { caching: 'network-or-cache' }, student);
    this.getClassificatinLegend(intake, { caching: 'network-or-cache' }, student);
  }
}
