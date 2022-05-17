import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertButton, LoadingController } from '@ionic/angular';
import { map, Observable, shareReplay, tap } from 'rxjs';

import { StudentProfile, SurveyIntake, SurveyModule } from '../../interfaces';
import { ComponentService, WsApiService } from '../../services';

@Component({
  selector: 'app-student-survey',
  templateUrl: './student-survey.page.html',
  styleUrls: ['./student-survey.page.scss'],
})
export class StudentSurveyPage implements OnInit {

  // TEMP VARIABLES
  todaysDate = new Date();
  lecturerName = '';

  COURSE_CODE$: Observable<SurveyIntake[]>;
  COURSE_MODULES$: Observable<SurveyModule[]>;
  survey$: Observable<any[]>;
  // IF USER IS COMING FROM RESULTS PAGE
  fromResultsPage = false;

  intakeCode: string;
  classCode: string;
  currentIntake: string;
  courseType: string;
  surveyType: string;
  selectedModule: SurveyModule;
  selectedIntake: SurveyIntake;
  modules: any;
  response = {
    class_code: '',
    intake_code: '',
    survey_id: 0,
    answers: [
      {
        question_id: 0,
        content: '',
      },
    ],
  };
  showFieldMissingError = false;
  skeletons = new Array(3);
  msqAnswers = [
    { id: '5', content: 'Strongly Agree' },
    { id: '4', content: 'Agree' },
    { id: '3', content: 'Neither' },
    { id: '2', content: 'Disagree' },
    { id: '1', content: 'Strongly Disagree' },
  ];

  constructor(
    private ws: WsApiService,
    private route: ActivatedRoute,
    private router: Router,
    private component: ComponentService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state?.moduleCode) {
        this.fromResultsPage = true;
        this.classCode = this.router.getCurrentNavigation().extras.state?.moduleCode;
        this.intakeCode = this.router.getCurrentNavigation().extras.state?.intakeCode;
      }
    });
    this.getStudentProfile().subscribe(profile => this.currentIntake = profile.INTAKE);

    this.initData();
  }

  initData() {
    if (!this.fromResultsPage) {
      return this.COURSE_CODE$ = this.getIntakes().pipe(
        tap(intakes => {
          if (intakes.length > 0) {
            const findIntake = intakes.find(intake => intake.INTAKE_CODE === this.currentIntake);
            // Check if student active intake is available
            if (findIntake) {
              this.selectedIntake = findIntake;
            } else {
              this.selectedIntake = intakes[0];
            }
          }
        }),
        tap(() => this.onIntakeCodeChanged())
      );
    }
    this.COURSE_CODE$ = this.getIntakes().pipe(
      tap(intakes => {
        if (intakes.length > 0) {
          const findIntake = intakes.find(intake => intake.INTAKE_CODE === this.currentIntake);
          // Check if student active intake is available
          if (findIntake) {
            this.selectedIntake = findIntake;
          } else {
            this.selectedIntake = intakes[0];
          }
        }
      })
    ); // get all of the intakes
    this.COURSE_MODULES$ = this.getModules(this.intakeCode).pipe( // get all of the modules
      tap(() => {
        this.getModuleByClassCode(this.classCode); // get the details of the selected module
        this.surveyType = 'End-Semester'; // The only survey that will block results page is the end-semester survey
      }),
      tap(() => this.getSurveys(this.intakeCode)), // get the survey for the intake (survey is for intake, not for module)
    );
  }

  onIntakeCodeChanged() {
    this.fromResultsPage = false;
    this.courseType = this.selectedIntake.TYPE_OF_COURSE;
    this.intakeCode = this.selectedIntake.COURSE_CODE_ALIAS;

    this.COURSE_MODULES$ = this.getModules(this.intakeCode);
    this.classCode = ''; // empty class code
    this.surveyType = ''; // empty survey type
  }

  onClassCodeChanged() {
    this.fromResultsPage = false;
    this.lecturerName = '';
    this.surveyType = '';
    this.getSurveyType(this.classCode);
    this.getModuleByClassCode(this.classCode);
    this.showFieldMissingError = false;
  }

  submitSurvey() {
    let message: string;
    let endpoint: string;

    if (this.surveyType === 'Programme Evaluation') {
      message = `You are about to submit the programme survey for the intake ${this.intakeCode}. Do you want to continue?`;
      endpoint = '/survey/programme_response';
    } else {
      message = `Are you sure you want to submit the survey for the class code ${this.classCode}?`;
      endpoint = '/survey/response';
    }
    const btn: AlertButton = {
      text: 'Confirm',
      cssClass: 'success',
      handler: async () => {
        // Filter to questions that has no answers
        const incompleteQuestions = this.response.answers.filter(answer => !answer.content);
        if (incompleteQuestions.length > 0) {
          this.showFieldMissingError = true;
          this.component.alertMessage('Missing Answers', 'Please ensure you answer all the required questions.');
          return;
        }
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...'
        });
        await loading.present();
        this.ws.post(endpoint, { body: this.response }).subscribe({
          next: () => {
            this.component.toastMessage('Survey has been successfully submitted.', 'success');
            loading.dismiss();
            this.classCode = '';
            this.initData();
          },
          error: (err) => {
            loading.dismiss();
            if (err.status === 400) {
              return this.component.toastMessage('Please make sure you answer all the questions', 'danger');
            }
            this.component.toastMessage('Something went wrong and we could not complete your request. Please try again or contact us via the feedback page', 'danger');
          }
        });
      }
    }
    this.component.alertMessage('Submit Survey', message, '', btn);
  }

  getIntakes(): Observable<SurveyIntake[]> {
    return this.ws.get<SurveyIntake[]>(`/survey/intakes-list`).pipe(
      map(i => i.reverse())
    );
  }

  getStudentProfile(): Observable<StudentProfile> {
    return this.ws.get<StudentProfile>('/student/profile');
  }

  getModules(intakeCode: string): Observable<SurveyModule[]> {
    return this.ws.get<SurveyModule[]>(`/survey/modules-list?intake_code=${intakeCode}`).pipe(
      map(module => {
        return module.filter(m => !m.COURSE_APPRAISAL || (!m.COURSE_APPRAISAL2 && Date.parse(m.END_DATE) > Date.parse(this.todaysDate.toISOString())));
      }),
      tap(modules => {
        this.modules = modules;

        if (this.courseType) {
          if (!this.courseType.toLowerCase().includes('master') && !this.courseType.toLowerCase().includes('phd')) {
            if (modules.length === 0 && !this.selectedIntake.PROGRAM_APPRAISAL && Date.parse(this.selectedIntake.PROGRAM_APPRAISAL_DATE) < Date.parse(this.todaysDate.toISOString())) {
              this.surveyType = 'Programme Evaluation';
              this.getSurveys(this.intakeCode);
            }
          }
        }
      }),
      shareReplay(1)
    );
  }

  getModuleByClassCode(classCode: string) {
    if (!this.fromResultsPage) {
      this.modules.forEach(module => {
        if (module.CLASS_CODE === classCode) {
          this.selectedModule = module;
          this.ws.get(`/staff/listing?staff_username=${module.SAMACCOUNTNAME}`).subscribe({
            next: (res: any) => {
              if (res.length > 0) {
                this.lecturerName = res[0].FULLNAME;
              }
            }
          });
        }
      });
    } else {
      this.modules.forEach(module => {
        if (module.SUBJECT_CODE === classCode) {
          this.selectedModule = module;
          this.classCode = module.CLASS_CODE;
          this.ws.get(`/staff/listing?staff_username=${module.SAMACCOUNTNAME}`).subscribe({
            next: (res: any) => {
              if (res.length > 0) {
                this.lecturerName = res[0].FULLNAME;
              }
            }
          });
        }
      });
    }
  }

  getSurveys(intakeCode: string) {
    const answers = [];
    this.survey$ = this.ws.get<any>(`/survey/surveys?intake_code=${intakeCode}`).pipe(
      map(surveys => surveys.filter(survey => survey.type === this.surveyType)),
      tap(surveys => {
        for (const section of surveys[0].sections) {
          for (const question of section.questions) {
            answers.push({
              question_id: question.id,
              content: '',
            });
          }
        }
        this.response = {
          intake_code: this.intakeCode,
          class_code: this.classCode,
          survey_id: surveys[0].id,
          answers,
        };
      }),
    );
  }

  getSurveyType(classCode: string) {
    const todaysDate = new Date();
    this.modules.forEach(amodule => {
      if (classCode === amodule.CLASS_CODE) {
        if (!amodule.COURSE_APPRAISAL) { // student did not do end semester appraisal
          if (todaysDate > new Date(amodule.END_DATE)) { // appraisal should only appear when student finish the module
            this.surveyType = 'End-Semester';
          }
        }
        if (!amodule.COURSE_APPRAISAL2) { // student did not do mid-semester appraisal
          if (this.courseType.toLowerCase().includes('master')) { // masters students
            const moduleStartDate = new Date(amodule.START_DATE); // module start date
            if (amodule.STUDY_MODE === 'FullTime') { // full time student
              // tslint:disable-next-line: max-line-length
              const startDateForMid = new Date(new Date(amodule.START_DATE).setDate(moduleStartDate.getDate() + 21)); // start of week 4 of the module
              // tslint:disable-next-line: max-line-length
              const endDateForMid = new Date(new Date(amodule.START_DATE).setDate(moduleStartDate.getDate() + 49)); // start of week 8 of the module
              if (todaysDate >= startDateForMid && todaysDate < endDateForMid) { // week 8 is not included
                this.surveyType = 'Mid-Semester';
              }
            } else {
              // tslint:disable-next-line: max-line-length
              const startDateForMid = new Date(new Date(amodule.START_DATE).setDate(moduleStartDate.getDate() + 14)); // start of week 3 of the module
              // tslint:disable-next-line: max-line-length
              const endDateForMid = new Date(new Date(amodule.START_DATE).setDate(moduleStartDate.getDate() + 42)); // start of week 7 of the module
              if (todaysDate >= startDateForMid && todaysDate < endDateForMid) { // week 7 is not included
                this.surveyType = 'Mid-Semester';
              }
            }
          } else { // all students except master, aplc and phd
            if (
              !this.courseType.toLowerCase().includes('language') && // hide mid-survey for language
              !this.courseType.toLowerCase().includes('ielts') && // hide mid-survey for english
              !this.courseType.toLowerCase().includes('phd') // hide mid-survey for english
            ) {
              const moduleStartDate = new Date(amodule.START_DATE); // module start date
              // tslint:disable-next-line: max-line-length
              const startDateForMid = new Date(new Date(amodule.START_DATE).setDate(moduleStartDate.getDate() + 42)); // start of week 7 of the module
              // tslint:disable-next-line: max-line-length
              const endDateForMid = new Date(new Date(amodule.START_DATE).setDate(moduleStartDate.getDate() + 70)); // start of week 11 of the module

              if (todaysDate >= startDateForMid && todaysDate < endDateForMid) { // week 10 is not included (11-Feb-2020, week 10 included)
                this.surveyType = 'Mid-Semester';
              }
            }
          }
        }
        this.getSurveys(this.intakeCode);
      }
    });
  }

  getAnswerByQuestionId(id: number) {
    return this.response.answers.filter(answer => answer.question_id === id)[0];
  }
}
