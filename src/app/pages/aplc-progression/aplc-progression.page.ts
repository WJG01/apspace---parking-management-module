import { Component, OnInit } from '@angular/core';
import { AlertButton, LoadingController } from '@ionic/angular';
import { Observable, tap } from 'rxjs';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { APLCSubject, APLCClass, APLCClassDescription, APLCStudentBehaviour } from '../../interfaces';
import { ComponentService, WsApiService } from '../../services';

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
  descriptionLegend$: Observable<{}>; // keys are dynamic

  pdfStudentsList: any; // array of arrays (format required by the library)
  skeletons = new Array(6);
  classDescription: APLCClassDescription[] = [];
  pdfObj = null; // used to generate report
  numberOfStudents = 0;
  numberOfReportsSubmitted = 0;
  remarksLimit = 200;
  scores = [1, 2, 3];
  editMode = false;
  term = '';
  // ngModel variables
  subjectCode: string;
  classCode: string;
  devUrl = 'https://kh1rvo4ilf.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(
    private ws: WsApiService,
    private component: ComponentService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh() { // changed with refresher
    this.subjects$ = this.ws.get<APLCSubject[]>(`/aplc/subjects`, { url: this.devUrl });
    this.scoreLegend$ = this.ws.get<any[]>(`/aplc/score-legend`, { caching: 'cache-only', url: this.devUrl });
    this.descriptionLegend$ = this.ws.get<any[]>(`/aplc/description-legend`, { caching: 'cache-only', url: this.devUrl });
  }

  onSubjectCodeChange() {
    this.classes$ = this.ws.get<APLCClass[]>(`/aplc/classes?subject_code=${this.subjectCode}`, { url: this.devUrl }).pipe(
      tap(_ => this.classCode = '')
    );
  }

  onClassCodeChange() {
    this.numberOfStudents = 0;
    this.numberOfReportsSubmitted = 0;
    this.editMode = false;
    this.classDescription$ = this.ws.get<APLCClassDescription[]>(`/aplc/class-description?class_code=${this.classCode}`, { url: this.devUrl }).pipe(
      tap(res => this.classDescription = res)
    );
    this.studentsBehaviour$ = this.ws.get<APLCStudentBehaviour[]>(`/aplc/student-behavior?class_code=${this.classCode}`, { url: this.devUrl }).pipe(
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
        producer: 'APSpace'

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
    const btn: AlertButton = {
      text: 'Yes',
      handler: async () => {
        let formValidFalg = true;
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...',
        });
        await loading.present();
        studentBehaviors.forEach(studentBehavior => {
          if ((studentBehavior.COMPLETING_BEH === 0 ||
            studentBehavior.CONCEPT_BEH === 0 ||
            studentBehavior.SOCIAL_BEH === 0 ||
            studentBehavior.ACADEMIC_BEH === 0) && (
              studentBehavior.COMPLETING_BEH !== 0 ||
              studentBehavior.CONCEPT_BEH !== 0 ||
              studentBehavior.SOCIAL_BEH !== 0 ||
              studentBehavior.ACADEMIC_BEH !== 0
            )) {
            // user submitted part of a student behavior only
            formValidFalg = false;
          }
        });

        if (formValidFalg) {
          this.ws.put<any>('/aplc/student-behavior', {
            url: this.devUrl,
            body: studentBehaviors
          }).subscribe({
            next: () => {
              this.component.toastMessage('Student behaviors has been updated successfully!', 'success');
            },
            error: () => {
              this.component.toastMessage('Something went wrong! please try again or contact us via the feedback page', 'danger');
            },
            complete: () => {
              loading.dismiss();
              this.doRefresh();
              this.editMode = false;
            }
          });
        } else {
          loading.dismiss();
          this.component.toastMessage('Once you start filling up the behavior for a student you must finish all his/her behaviors', 'danger');
        }
      }
    }

    this.component.alertMessage('Confirm!', 'You are about to update the students\' behaviors. Do you want to continue?', 'Cancel', btn, 'danger-alert');
  }
}
