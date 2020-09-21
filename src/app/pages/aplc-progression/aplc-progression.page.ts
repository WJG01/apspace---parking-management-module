import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { APLCClass, APLCClassDescription, APLCStudentBehaviour, APLCSubject } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';


pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-aplc-progression',
  templateUrl: './aplc-progression.page.html',
  styleUrls: ['./aplc-progression.page.scss'],
})
export class AplcProgressionPage implements OnInit {

  subjects$: Observable<APLCSubject[]>;
  classes$: Observable<APLCClass[]>;
  classDescription$: Observable<APLCClassDescription[]>;
  studentsBehaviour$: Observable<APLCStudentBehaviour[]>;
  scoreLegend$: Observable<any>; // keys are dynamic
  descriptionLegend$: Observable<any>; // keys are dynamic

  pdfStudentsList: any; // array of arrays (format required by the library)
  skeletons = new Array(6);
  classDescription: APLCClassDescription[] = [];
  pdfObj = null; // used to generate report
  numberOfStudents = 0;
  numberOfReportsSubmitted = 0;
  loading: HTMLIonLoadingElement;
  remarksLimit = 200;
  scores = [1, 2, 3];
  editMode = false;
  term = '';
  // ngModel
  subjectCode: string;
  classCode: string;

  constructor(
    private ws: WsApiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.initData();
  }

  initData() { // changed with refresher
    this.subjects$ = this.ws.get<APLCSubject[]>(`/aplc/subjects`);
    this.scoreLegend$ = this.ws.get<any[]>(`/aplc/score-legend`, { caching: 'cache-only' });
    this.descriptionLegend$ = this.ws.get<any[]>(`/aplc/description-legend`, { caching: 'cache-only' });
  }

  onSubjectCodeChange() {
    this.classes$ = this.ws.get<APLCClass[]>(`/aplc/classes?subject_code=${this.subjectCode}`).pipe(
      tap(_ => this.classCode = '')
    );
  }

  onClassCodeChange() {
    this.numberOfStudents = 0;
    this.numberOfReportsSubmitted = 0;
    this.editMode = false;
    this.classDescription$ = this.ws.get<APLCClassDescription[]>(`/aplc/class-description?class_code=${this.classCode}`).pipe(
      tap(res => this.classDescription = res)
    );
    this.studentsBehaviour$ = this.ws.get<APLCStudentBehaviour[]>(`/aplc/student-behavior?class_code=${this.classCode}`).pipe(
      tap(r => console.log('r ', r)),
      tap(_ => this.pdfStudentsList = [ // empty the list whenever there is an update
        [
          { text: 'Student Name', bold: true, style: 'tableHeader' },
          { text: 'Student ID', bold: true, style: 'tableHeader', alignment: 'center' },
          { text: 'Average Score', bold: true, style: 'tableHeader', alignment: 'center' },
          { text: 'Remarks', bold: true, style: 'tableHeader' }
        ]
      ]),
      tap(res => res.forEach(student => {
        const studentData = [
          { text: student.STUDENT_NAME },
          { text: student.STUDENT_NUMBER, alignment: 'center' },
          { text: student.AVERAGE_BEH, alignment: 'center' },
          { text: student.REMARK }
        ];
        this.pdfStudentsList.push(studentData);
        this.numberOfStudents += 1;
        if (+student.AVERAGE_BEH > 0) {
          this.numberOfReportsSubmitted += 1;
        }

      }))
    );
  }

  generateReport() {
    const currentDate = new Date();
    const dateForFileName = `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDate()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}`;
    const pdfTitle = `PR--${this.classCode}--${dateForFileName}`;

    const docDefinition = {
      info: {
        title: pdfTitle,
        author: this.classDescription[0].LECTURER_NAME,
        subject: 'Progress Report',
        keywords: 'APLC APSpace Reports',
        creator: 'APSpace',
        producer: 'APSpace',
        creationDate: currentDate.toDateString(),
        modDate: currentDate.toDateString(),

      },
      content: [
        {
          text: 'APIIT Education Group',
          style: 'header',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        },

        {
          text: 'APLC Progress Report',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        },

        {
          text: this.classCode,
          style: 'subheader2bold',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        },

        {
          text: `${this.classDescription[0].SDATE} - ${this.classDescription[0].EDATE}`,
          style: 'subheader2bold',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        },

        { text: '', margin: [5, 20, 5, 10] },

        {
          columns: [
            {
              width: '5%',
              text: ''
            },
            {
              width: '40%',
              alignment: 'center',
              text: 'Lecturer Name',
              style: 'subheader2bold'
            },
            {
              width: '10%',
              text: ''
            },
            {
              width: '40%',
              alignment: 'center',
              text: 'Subject Code',
              style: 'subheader2bold'
            },
            {
              width: '5%',
              text: ''
            },
          ],
          columnGap: 1
        },


        {
          columns: [
            {
              width: '5%',
              text: ''
            },
            {
              width: '40%',
              alignment: 'center',
              text: this.classDescription[0].LECTURER_NAME
            },
            {
              width: '10%',
              text: ''
            },
            {
              width: '40%',
              alignment: 'center',
              text: this.subjectCode
            },
            {
              width: '5%',
              text: ''
            },
          ],
          columnGap: 1,
          margin: [0, 5, 0, 0]
        },

        { text: '', margin: [5, 20, 5, 10] },


        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', '*'],
            body: this.pdfStudentsList,
            pageBreak: 'after'
          }
        },

        { text: 'Average Score Legend', style: 'subheader', margin: [5, 30, 5, 10] },

        {
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: [
              [{ text: 'Legend', bold: true, style: 'tableHeader' }, { text: 'Description', bold: true, style: 'tableHeader' }],
              [{ text: '1', bold: true, alignment: 'center' }, 'A below average student. Needs improvement as student displays poor attitude or behaviour throughout the intake.'],
              [{ text: '>1-2', bold: true, alignment: 'center' }, 'An average student. Has shown satisfactory or reasonable improvement throughout the intake.'],
              [{ text: '>2-3', bold: true, alignment: 'center' }, 'An excellent student. Has fully shown exceptional development in every aspect throughout the intake.'],
            ],
            pageBreak: 'after'
          }
        }

      ],
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            { width: '5%', text: '' },
            {
              width: '75%',
              text: `Generated using APSpace (${currentDate.toDateString()})`,
              alignment: 'left',
              style: 'greyColor'
            },
            {
              width: '5%',
              text: ''
            },
            {
              width: '10%',
              text: currentPage.toString() + ' of ' + pageCount,
              alignment: 'right',
              style: 'greyColor'
            },
            { width: '5%', text: '' }
          ]
        };
      },

      styles: {
        greyColor: {
          color: '#8a8a8a'
        },
        tableHeader: {
          color: '#FFFFFF',
          fillColor: '#A9A9A9'
        },
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 15, 0, 0]
        },
        subheader2bold: {
          fontSize: 12,
          bold: true,
          margin: [0, 15, 0, 0]
        },
        subheader2: {
          fontSize: 12,
          bold: false,
          margin: [0, 15, 0, 0]
        },
        story: {
          italic: true,
          alignment: 'center',
          width: '50%',
        }
      }
    };
    this.pdfObj = pdfMake.createPdf(docDefinition);
    this.pdfObj.download(pdfTitle + '.pdf');

  }

  submit(studentBehaviors: APLCStudentBehaviour[]) {
    this.alertCtrl.create({
      header: 'Confirm!',
      message: 'You are about to update the students\' behaviors. Do you want to continue?',
      cssClass: 'danger-alert',
      buttons: [
        {
          text: 'Cancel',
          handler: () => { }
        },
        {
          text: 'Yes',
          handler: () => {
            // START THE LOADING
            let formValidFalg = true;
            this.presentLoading();
            console.log(studentBehaviors);
            studentBehaviors.forEach(studentBehavior => {
              if (
                (studentBehavior.COMPLETING_BEH === 0 ||
                  studentBehavior.CONCEPT_BEH === 0 ||
                  studentBehavior.SOCIAL_BEH === 0 ||
                  studentBehavior.ACADEMIC_BEH === 0) && (
                  studentBehavior.COMPLETING_BEH !== 0 ||
                  studentBehavior.CONCEPT_BEH !== 0 ||
                  studentBehavior.SOCIAL_BEH !== 0 ||
                  studentBehavior.ACADEMIC_BEH !== 0
                ) // user submitted part of a student behavior only
              ) {
                formValidFalg = false;
              }
            });
            if (formValidFalg) {
              this.ws.put<any>('/aplc/student-behavior', {
                body: studentBehaviors
              }).subscribe(
                {
                  next: _ => {
                    this.showToastMessage('Student behaviors has been updated successfully!', 'success');
                  },
                  error: _ => {
                    this.showToastMessage('Something went wrong! please try again or contact us via the feedback page', 'danger');
                  },
                  complete: () => {
                    this.dismissLoading();
                    this.initData();
                    this.editMode = false;
                  }
                }
              );
            } else {
              this.dismissLoading();
              this.showToastMessage('Once you start filling up the behavior for a student you must finish all his/her behaviors', 'danger');
            }
          }
        }
      ]
    }).then(confirm => confirm.present());
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      spinner: 'dots',
      duration: 5000,
      message: 'Please wait...',
      translucent: true,
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    return await this.loading.dismiss();
  }

  showToastMessage(message: string, color: 'danger' | 'success') {
    this.toastCtrl.create({
      message,
      duration: 7000,
      position: 'top',
      color,
      animated: true,
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ],
    }).then(toast => toast.present());
  }

}
