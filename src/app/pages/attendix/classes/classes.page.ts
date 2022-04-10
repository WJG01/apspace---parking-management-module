import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertButton, ModalController } from '@ionic/angular';
import { firstValueFrom, map, Observable, shareReplay } from 'rxjs';

import { subDays } from 'date-fns';

import { DatePickerComponent } from '../../../components/date-picker/date-picker.component';
import { SearchModalComponent } from '../../../components/search-modal/search-modal.component';
import { Classcodev1, FlatClasscode } from '../../../interfaces';
import { ComponentService, WsApiService } from '../../../services';
import { ResetAttendanceGQL, ScheduleInput } from '../../../../generated/graphql';
import { Durations, Timings } from '../../../constants';
import { formatTime, isoDate, parseTime } from '../date';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.page.html',
  styleUrls: ['./classes.page.scss'],
})
export class ClassesPage implements OnInit {

  classcodes$: Observable<FlatClasscode[]>;
  durations = Durations;
  timings = Timings;
  reportLinks = [
    {
      name: 'Attendance Summary Report',
      url: 'https://report.apu.edu.my/jasperserver-pro/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2FAttendance&reportUnit=%2FAttendance%2FAttendance_Summary&standAlone=true'
    },
    {
      name: 'Lecturer Class Report',
      url: 'https://report.apu.edu.my/jasperserver-pro/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2FAttendance&reportUnit=%2FAttendance%2FLecturer_Class_Report&standAlone=true'
    },
    {
      name: 'Incourse Marksheet',
      url: 'https://report.apu.edu.my/jasperserver-pro/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2FAttendance&reportUnit=%2FAttendance%2FIncourse_Marksheet&standAlone=true'
    }
  ];
  classTypes = ['Lecture', 'Tutorial', 'Lab'];
  userCameFromTimetableFlag: string;

  markAttendanceObject: {
    classcode: string,
    date: string,
    startTime: string;
    endTime: string;
    duration: number;
    classType: string;
    defaultAttendance: 'N' | 'Y';
  } = {
      classcode: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: 0,
      classType: '',
      defaultAttendance: 'N' // default is absent
    };
  attendanceHistoryObject = {
    term: '', // classcode search term
    timeFrame: 7 // show the attendance history for the last 7 days by default
  }
  skeletons = new Array(2);
  startTimes: string[];
  skeleton = new Array(7);

  constructor(
    private component: ComponentService,
    private route: ActivatedRoute,
    private router: Router,
    private ws: WsApiService,
    private modalCtrl: ModalController,
    private datePipe: DatePipe,
    private resetAttendance: ResetAttendanceGQL,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    // get navigation extras if any
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        // set value to userCameFromTimetableFlag to prevent code inside ionViewDidEnter from running
        const paramModuleId: string | null = this.userCameFromTimetableFlag = this.router.getCurrentNavigation().extras.state.moduleId;
        const paramDate: string | null = this.router.getCurrentNavigation().extras.state.date; // 2020-12-31
        const paramStartTime: string | null = this.router.getCurrentNavigation().extras.state.startTime;
        const paramEndTime: string | null = this.router.getCurrentNavigation().extras.state.endTime;
        const paramIntakes: string | null = this.router.getCurrentNavigation().extras.state.intakes; // list of intakes seperated by ','
        this.getClasscodes();
        this.markAttendanceObject.date = paramDate;
        // this.changeDate(this.markAttendanceObject.date = paramDate);
        this.markAttendanceObject.startTime = paramStartTime;
        this.markAttendanceObject.endTime = paramEndTime;
        this.markAttendanceObject.duration = parseTime(this.markAttendanceObject.endTime) - parseTime(this.markAttendanceObject.startTime);
        this.findMostSimilarClassCodes(paramModuleId, paramIntakes);
      }
    });
  }

  ionViewDidEnter() {
    // run only if the user is not coming from timetable "quick attendance button"
    if (!this.userCameFromTimetableFlag) {
      this.getClasscodes();
    }
  }

  /**
   * Flat the classcodes response (remove the grouping by classcode).
   * add classcode, code_aliases, subject code and lecturer code inside each class object from the CLASSES
   */
  mergeClasscodes(classcodes: Classcodev1[]): FlatClasscode[] {
    const finalResults = [];
    classcodes.map(classcode => {
      // if the classcode has no classes yet
      if (classcode.CLASSES.length === 0) {
        finalResults.push({
          CLASSES: [],
          CLASS_CODE: classcode.CLASS_CODE,
          COURSE_CODE_ALIASES: classcode.COURSE_CODE_ALIASES,
          SUBJECT_CODE: classcode.SUBJECT_CODE,
          LECTURER_CODE: classcode.LECTURER_CODE
        });
      }
      return classcode.CLASSES.map(klass => {
        const updatedClass = (
          {
            ...klass,
            CLASS_CODE: classcode.CLASS_CODE,
            COURSE_CODE_ALIASES: classcode.COURSE_CODE_ALIASES,
            SUBJECT_CODE: classcode.SUBJECT_CODE,
            LECTURER_CODE: classcode.LECTURER_CODE
          });
        finalResults.push(updatedClass);
        return updatedClass;
      });
    });
    return finalResults;
  }

  /* find the most similar class codes and pass them to the modal page */
  async findMostSimilarClassCodes(paramModuleId: string, paramIntakes: string) {
    /*
      - the code is not finalized and it has been seperated into steps to make the test process easeir.
      - all console logs are commented and will be removed once we make sure there is no issue at all
      - some parts of this function will be grouped together after finalizing the code
    */
    const classcodes = [...new Set((await firstValueFrom(this.classcodes$)).map(c => c.CLASS_CODE))];
    // console.log('selected module code is: ', paramModuleId);
    // console.log('All classcodes are: ', classcodes);

    // step 1: remove curly brace, square bracket and parenthesis with data isnide them from module code
    const cleanModuleCode = paramModuleId.replace(/\(.*\)|\[.*\]|\{.*\}/g, '');
    // console.log('clean module code is: ', cleanModuleCode);

    // step 2: convert intakes string to array (split on ',')
    const intakes = paramIntakes.split(',');
    // console.log('intakes are: ', intakes);

    // step 3: remove specialisms from intakes
    const intakesWithoutSpec = intakes.map(intake => intake.replace(/\(.*\)/g, ''));
    // console.log('intakes without spec: ', intakesWithoutSpec);

    // step 4: remove duplicates from intakes array
    const uniqueIntakes = intakesWithoutSpec.filter((v, i) => intakesWithoutSpec.indexOf(v) === i);
    // console.log('intakes unique are: ', uniqueIntakes);

    // step 5: split module code into parts (split on '-')
    const moduleCodeParts = cleanModuleCode.split('-');
    // console.log('module code parts are ', moduleCodeParts);

    // step 6: filter classcodes to the one that matches first part (before first -) in module code
    const firstPartOfModuleCode = moduleCodeParts[0];

    // step 7: filter class codes to the ones that have the same starting
    // console.log('first part of module code is', firstPartOfModuleCode);
    const classCodesToSearchInto = classcodes.filter((cc: string) => cc.startsWith(firstPartOfModuleCode));
    // console.log('classcodes filtered based on first part are ', classCodesToSearchInto);

    // step 8: remove any part of the module code that has numbers only numbers are common and can reduce
    const moduleCodePartsWithoutNumbers = moduleCodeParts.filter(part => !part.match(/^\d+$/));
    // console.log('module code parts without numbers: ', moduleCodePartsWithoutNumbers);

    // step 9: if 'L' or 'T' is part of the module code array => add '-' before it to increase the chance of getting the currect class code
    // tslint:disable-next-line: max-line-length
    const moduleCodePartsWithSingleLetterModified = moduleCodePartsWithoutNumbers.map(part => part === 'T' || part === 'L' ? '-' + part : part);
    // console.log('module code parts with modified single letter: ', moduleCodePartsWithSingleLetterModified);

    // step 10: join the module code array and use 'or wildcard (|)' to sepearate them
    let moduleCodePartsCombinedWithOr = moduleCodePartsWithSingleLetterModified.join('|');
    // console.log('module code combined with OR: ', moduleCodePartsCombinedWithOr);

    // step 11: if list of intakes is not empty, add the intakes to the module code array
    if (uniqueIntakes.length > 0) {
      moduleCodePartsCombinedWithOr = moduleCodePartsCombinedWithOr + '|' + uniqueIntakes.join('|');
      // console.log('intake/s found');
      // console.log('module code combined with OR With intakes: ', moduleCodePartsCombinedWithOr);
    }

    // step 12: create results array
    const results: { value: string, matches: number }[] = [];

    // step 13: finding the results:
    //    1. loop throw the list of class codes that matches the first part of module code
    //    2. see how many parts of the module code match each class code
    //    3. store the class code in the results array alongside with the number of matches
    const searchRegExpOr = new RegExp(moduleCodePartsCombinedWithOr, 'gi');

    classcodes.forEach(classcode => {
      if (classcode.includes(paramModuleId)) {
        results.push({ value: classcode, matches: 100 });
      }
    });

    classCodesToSearchInto.forEach(classCode => {
      if (classCode.match(searchRegExpOr)) {
        results.push({ value: classCode, matches: classCode.match(searchRegExpOr).length });
      }
    });

    // step 14: sort the results array from the class code that has highest matches to the lowest
    results.sort((a, b) => b.matches - a.matches);
    // console.log('sorted results: ', results);

    // step 15: check the results array
    // console.log('final results are: ', results);

    // step 16: ONLY if results array length is more than 0, open the modal
    if (results.length > 0) {
      this.openconfirmClassCodeModal(results);
    } else {
      this.chooseClasscode();
    }
  }

  getClasscodes() {
    this.classcodes$ = this.ws.get<Classcodev1[]>('/attendix/v1/classcodes').pipe(
      map(classcodes => this.mergeClasscodes(classcodes)), // side effect
      shareReplay(1),
    );
  }

  /** Display search modal to choose classcode. */
  async chooseClasscode() {
    const classcodes = [...new Set((await firstValueFrom(this.classcodes$)).map(c => c.CLASS_CODE))];
    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      componentProps: {
        items: classcodes,
        defaultItems: classcodes
      }
    });
    await modal.present();
    const { data: { item: classcode } = { item: this.markAttendanceObject.classcode } } = await modal.onDidDismiss();
    if (classcode !== this.markAttendanceObject.classcode) {
      this.markAttendanceObject.classcode = classcode;
    }
  }

  async openPicker() {
    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'date',
        minDate: subDays(new Date(), 98).toISOString(),
        maxDate: new Date().toISOString(),
      },
      cssClass: 'date-picker-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.date) {
      this.markAttendanceObject.date = data.date;

      const newDate = new Date();

      const localToUtcOffset = (newDate.getTimezoneOffset());
      const localParsedDate = Date.parse(newDate.toString());

      const utcDate = new Date(localParsedDate + (localToUtcOffset * 60000));
      const utcParsedDate = Date.parse(utcDate.toUTCString());

      const d = new Date(utcParsedDate + (480 * 60000));

      if (isoDate(new Date(data.date)) === isoDate(d)) { // current day
        const nowMins = d.getHours() * 60 + d.getMinutes();
        const firstFutureClass = this.timings.find(time => nowMins < parseTime(time));
        this.startTimes = this.timings.slice(0, this.timings.indexOf(firstFutureClass));
      } else {
        this.startTimes = this.timings;
      }
    }
  }

  /** if start time updated after duration => update duration . */
  changeStartTime() {
    if (this.markAttendanceObject.duration) {
      this.calculateEndTime(this.markAttendanceObject.duration);
    }
  }

  /** Calculate end time using start time and duration. */
  calculateEndTime(duration: number) {
    this.markAttendanceObject.endTime = formatTime(parseTime(this.markAttendanceObject.startTime) + duration);
  }

  /** Mark attendance with validation. Double confirm */
  mark() {
    this.classcodes$.subscribe(classcodes => {
      const startTimeMins = parseTime(this.markAttendanceObject.startTime);
      const endTimeMins = parseTime(this.markAttendanceObject.endTime);
      // search for overlapped class
      const classes = [].concat(...classcodes
        .filter(classcode => this.markAttendanceObject.classcode === classcode.CLASS_CODE)); // use flat in es2019
      const overlap = classes.find(klass => this.markAttendanceObject.date === klass.DATE
        && startTimeMins < parseTime(klass.TIME_TO) && endTimeMins > parseTime(klass.TIME_FROM));
      if (overlap) {
        this.component.alertMessage('Failed to Mark!', `Sorry! There is another record (${this.datePipe.transform(overlap.DATE, 'EEE, dd MMM yyy')} ${overlap.TIME_FROM} - ${overlap.TIME_TO}) in the attendance history, that overlaps with this class which you are trying to mark attendance (${this.datePipe.transform(this.markAttendanceObject.date, 'EEE, dd MMM yyy')} ${this.markAttendanceObject.startTime} - ${this.markAttendanceObject.endTime}). Please check the details you have entered carefully`);
        return;
      }
      const btn: AlertButton = {
        text: 'Continue',
        handler: () => {
          this.router.navigate(['/attendix/mark-attendance', {
            classcode: this.markAttendanceObject.classcode,
            date: this.markAttendanceObject.date,
            startTime: this.markAttendanceObject.startTime,
            endTime: this.markAttendanceObject.endTime,
            classType: this.markAttendanceObject.classType,
            defaultAttendance: this.markAttendanceObject.defaultAttendance
          }]);
        }
      }

      this.component.alertMessage('Warning!', `By clicking on <span class="text-bold">'Continue'</span>, all students will be marked as ${this.markAttendanceObject.defaultAttendance === 'Y' ? 'Present' : 'Absent'} by default! ${this.markAttendanceObject.defaultAttendance === 'Y' ? '<br><br> <span class="text-bold">**Since you chose to mark all as Present by default, there will be no QR code displayed.</span>' : '.'}`, 'Cancel', btn);
    });
  }

  /** Clear all form data. */
  ionViewDidLeave() {
    this.markAttendanceObject = {
      classcode: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: 0,
      classType: '',
      defaultAttendance: 'N'
    }
    this.userCameFromTimetableFlag = '';
  }

  /** View current attendance. */
  view(classcode: string, date: string, startTime: string, endTime: string, classType: string) {
    this.router.navigate(['/attendix/view-attendance', { classcode, date, startTime, endTime, classType }]);
  }


  /** Edit current attendance. */
  edit(classcode: string, date: string, startTime: string, endTime: string, classType: string) {
    this.router.navigate(['/attendix/mark-attendance', { classcode, date, startTime, endTime, classType }]);
  }

  /** Delete (reset) attendance, double confirm. */
  reset(classcode: string, date: string, startTime: string, endTime: string, classType: string) {
    const schedule: ScheduleInput = { classcode, date, startTime, endTime, classType };
    const btn: AlertButton = {
      text: 'Delete',
      cssClass: 'danger',
      handler: () => {
        this.resetAttendance.mutate({ schedule }).subscribe({
          next: () => {
            this.component.toastMessage('Attendance deleted', 'success');
            this.getClasscodes();
          },
          error: (err) => {
            this.component.toastMessage(`Attendance delete failed: ${err}`, 'danger');
            console.error(err);
          }
        })
      }
    }

    this.component.alertMessage('Delete Attendance Record!', `Are you sure that you want to <span class="glob-danger-text glob-text-bold">Permanently Delete</span> the selected attendance record?<br><br> <span class="glob-text-bold">Class Code:</span> ${classcode}<br> <span class="glob-text-bold">Class Date:</span> ${this.datePipe.transform(date, 'EEE, dd MMM yyy')}<br> <span class="glob-text-bold">Class Time:</span> ${startTime} - ${endTime}<br> <span class="glob-text-bold">Class Type:</span> ${classType}`, 'Cancel', btn);
  }

  /* one last step modal that will open automatically when user uses quick attendnace button */
  async openconfirmClassCodeModal(filteredClassCodes: any[]) { // TODO: add type
    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      cssClass: 'glob-partial-page-modal',
      componentProps: {
        classTypes: this.classTypes,
        classCodes: filteredClassCodes,
      }
    });
    await modal.present();
    await modal.onDidDismiss().then(data => {
      if (data.data) {
        this.markAttendanceObject.classcode = data.data.code;
        this.markAttendanceObject.classType = data.data.type;
      }
    });
  }

  async checkIntegrity() {
    const classCodes = (await firstValueFrom(this.classcodes$));
    const possibleExtraClasses = [];
    classCodes.forEach(klass => {
      if (klass.TOTAL) {
        if (klass.TOTAL.ABSENT === klass.TOTAL.ABSENT + klass.TOTAL.PRESENT + klass.TOTAL.LATE + klass.TOTAL.ABSENT_REASON) {
          possibleExtraClasses.push(
            {
              classCode: klass.CLASS_CODE,
              date: klass.DATE,
              timeFrom: klass.TIME_FROM,
              timeTo: klass.TIME_TO,
              total: klass.TOTAL.ABSENT,
              type: klass.TYPE,
              checked: false
            }
          );
        }
      }
    });
    const modal = await this.modalCtrl.create({
      component: SearchModalComponent,
      componentProps: {
        possibleClasses: possibleExtraClasses.sort(
          (a, b) =>
            new Date(+b.date.split('-')[0], +b.date.split('-')[1], +b.date.split('-')[2]).getTime()
            - new Date(+a.date.split('-')[0], +a.date.split('-')[1], +a.date.split('-')[2]).getTime()
        )
      },
      backdropDismiss: false
    });
    await modal.present();
    await modal.onDidDismiss().then(data => {
      if (data.data && data.data.refresh) {
        this.getClasscodes();
      }
    });
  }

  async openQuickAction(klass: FlatClasscode) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Quick Access Menu',
      buttons: [
        {
          text: 'View',
          handler: () => {
            this.view(klass.CLASS_CODE, klass.DATE, klass.TIME_FROM, klass.TIME_TO, klass.TYPE);
          }
        },
        {
          text: 'Edit',
          handler: () => {
            this.edit(klass.CLASS_CODE, klass.DATE, klass.TIME_FROM, klass.TIME_TO, klass.TYPE);
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.reset(klass.CLASS_CODE, klass.DATE, klass.TIME_FROM, klass.TIME_TO, klass.TYPE);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  openUrl(url: string) {
    this.component.openLink(url);
  }
}
