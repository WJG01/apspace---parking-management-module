import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { ExamScheduleAdmin } from '../../../interfaces/exam-schedule-admin';
import { CalendarComponentOptions } from 'ion2-calendar';
import { addYears, format, isValid, parse, parseISO } from 'date-fns';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController, Platform, PopoverController } from '@ionic/angular';
import { ComponentService, NotifierService, WsApiService } from '../../../services';
import { HttpParams } from '@angular/common/http';
import { ExamDurationPipe } from './exam-duration.pipe';
import { SearchModalComponent } from '../../../components/search-modal/search-modal.component';
import { ManageAssessmentTypesPage } from './manage-assessment-types/manage-assessment-types.page';

@Component({
  selector: 'app-add-exam-schedule',
  templateUrl: './add-exam-schedule.page.html',
  styleUrls: ['./add-exam-schedule.page.scss'],
})
export class AddExamSchedulePage implements OnInit, OnDestroy {
  // devURL = 'https://swze54usn5.execute-api.ap-southeast-1.amazonaws.com/dev';

  @Input() onEdit: boolean;
  @Input() examScheduleDetails?: ExamScheduleAdmin;

  loading: HTMLIonLoadingElement;

  assessmentTypes$: Observable<any>;
  notification: Subscription;
  modules = [];

  type = 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range'
  };

  nextYears = format(addYears(new Date(), 3), 'yyyy');
  nextYearHtmlInput = format(addYears(new Date(), 3), 'yyyy-MM-dd');

  isCapacitor: boolean;

  examDuration: string;

  examScheduleForm: FormGroup;

  constructor(
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private ws: WsApiService,
    private component: ComponentService,
    private notifierService: NotifierService,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.isCapacitor = this.platform.is('capacitor');

    this.ws.get<any>('/exam/module_list').pipe(
      tap(modules => {
        modules.forEach(module => this.modules.push(module.MODULE_CODE));
      })
    ).subscribe();

    this.refreshAssessmentTypes();

    this.initializeForm(this.examScheduleDetails);

    this.notification = this.notifierService.assessmentTypeUpdated.subscribe(data => {
      if (data && data === 'SUCCESS') {
        this.refreshAssessmentTypes();
      }
    });
  }

  ngOnDestroy() {
    this.notification.unsubscribe();
  }

  initializeForm(examScheduleDetails: ExamScheduleAdmin = {
    ASSESSMENT_TYPE: '',
    CHECK_WEEK: 0,
    DATEDAY: '',
    DATEDAYEND: '',
    EXAM_TYPE: '',
    EXAMID: 0,
    FROMDATE: '',
    MODULE_CODE: '',
    MODULE_NAME: '',
    REMARKS: '',
    RESULT_DATE: '',
    STATUS: '',
    TILLDATE: '',
    TIME: '',
    TIMESTAMP: '',
    VENUE: ''
  }) {
    let splitTime;
    let startTime = '';
    let endTime = '';
    let publicationDate;

    if (this.onEdit && examScheduleDetails.TIME) {
      splitTime = examScheduleDetails.TIME.split(' ');
      startTime = format(parse(`${splitTime[0]} ${splitTime[1]}`, 'h:mm a', new Date()), 'HH:mm');
      endTime = format(parse(`${splitTime[3]} ${splitTime[4]}`, 'h:mm a', new Date()), 'HH:mm');
      publicationDate = {
        from: format(new Date(examScheduleDetails.FROMDATE), 'dd-MMM-yyyy'),
        to: format(new Date(examScheduleDetails.TILLDATE), 'dd-MMM-yyyy')
      };
    }

    this.examScheduleForm = this.formBuilder.group({
      publicationDate: [publicationDate, Validators.required],
      module: [examScheduleDetails.MODULE_CODE, Validators.required],
      date: [examScheduleDetails.DATEDAY, Validators.required],
      endDate: [examScheduleDetails.DATEDAYEND, Validators.required],
      startTime: [startTime, Validators.required],
      endTime: [endTime, Validators.required],
      assessmentType: [examScheduleDetails.ASSESSMENT_TYPE, Validators.required],
      remarks: [examScheduleDetails.REMARKS]
    });
  }

  refreshAssessmentTypes() {
    this.assessmentTypes$ = this.ws.get<any>('/exam/assessment_type');
  }

  async presentModuleSearch() {
    const popover = await this.popoverCtrl.create({
      component: SearchModalComponent,
      componentProps: {
        items: this.modules,
        isModal: false,
        notFound: 'No modules selected'
      },
      cssClass: 'glob-popover'
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        this.examScheduleForm.get('module').patchValue(data.data.item);
      }
    });

    return await popover.present();
  }

  async manageAssessmentTypes() {
    const modal = await this.modalCtrl.create({
      component: ManageAssessmentTypesPage,
      cssClass: 'glob-full-page-modal'
    });
    return await modal.present();
  }

  submit() {
    if (this.examScheduleForm.valid) {
      let isDuplicated = false;

      this.ws.get<ExamScheduleAdmin[]>('/exam/current_exam').pipe(
        tap(examSchedules => {
          let filteredExamSchedule = examSchedules;

          if (this.onEdit) {
            filteredExamSchedule = filteredExamSchedule.filter(examSchedule =>
              examSchedule.MODULE_CODE !== this.examScheduleDetails.MODULE_CODE ||
              format(new Date(examSchedule.FROMDATE), 'dd-MMM-yyyy')
              !== format(new Date(this.examScheduleDetails.FROMDATE), 'dd-MMM-yyyy')
              || format(new Date(examSchedule.TILLDATE), 'dd-MMM-yyyy')
              !== format(new Date(this.examScheduleDetails.TILLDATE), 'dd-MMM-yyyy')
            );
          }

          filteredExamSchedule.forEach(examSchedule =>
            examSchedule.MODULE_CODE === this.examScheduleForm.get('module').value &&
            format(new Date(examSchedule.FROMDATE), 'dd-MMM-yyyy') === this.examScheduleForm.get('publicationDate').value.from &&
            format(new Date(examSchedule.TILLDATE), 'dd-MMM-yyyy') === this.examScheduleForm.get('publicationDate').value.to ?
              isDuplicated = true : null
          );
        })
      ).subscribe(_ => {
        if (isDuplicated) {
          this.component.toastMessage('You cannot create duplicate exam schedule with the same module.', 'danger');
          return;
        }

        const bodyObject = {
          from_date: this.examScheduleForm.get('publicationDate').value.from.toUpperCase(),
          till_date: this.examScheduleForm.get('publicationDate').value.to.toUpperCase(),
          module: this.examScheduleForm.get('module').value,
          venue: '',
          dateday: format(new Date(this.examScheduleForm.get('date').value), 'dd-MMM-yyyy').toUpperCase(),
          datedayend: format(new Date(this.examScheduleForm.get('endDate').value), 'dd-MMM-yyyy').toUpperCase(),
          time: !this.isCapacitor ?
            (this.onEdit ? `${format(parse(this.examScheduleForm.get('startTime').value, 'HH:mm', new Date()), 'h:mm a')} till ${format(parse(this.examScheduleForm.get('endTime').value, 'HH:mm', new Date()), 'h:mm a')}` :
              `${format(parse(this.examScheduleForm.get('startTime').value, 'HH:mm', new Date()), 'h:mm a')} till ${format(parse(this.examScheduleForm.get('endTime').value, 'HH:mm', new Date()), 'h:mm a')}`)

            : (this.onEdit ? `${format(parseISO(this.examScheduleForm.get('startTime').value), 'h:mm a')} till ${format(parseISO(this.examScheduleForm.get('endTime').value), 'h:mm a')}` :
              `${format(new Date(this.examScheduleForm.get('startTime').value), 'h:mm a')} till ${format(new Date(this.examScheduleForm.get('endTime').value), 'h:mm a')}`),
          remarks: this.examScheduleForm.get('remarks').value,
          status: 'Inactive',
          result_date: '',
          check_week: '0',
          assessment_type: this.examScheduleForm.get('assessmentType').value
        };

        if (this.onEdit) {
          this.presentLoading();
          const body = new HttpParams({ fromObject: { exam_id: this.examScheduleDetails.EXAMID.toString(), ...bodyObject } }).toString();
          const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
          this.ws.post<any>('/exam/update_exam_schedule', {
            body,
            headers
          })
            .subscribe({
              next: () => {
                this.notifierService.examScheduleUpdated.next('SUCCESS');
                this.component.toastMessage('Exam Schedule updated successfully!', 'success');
              },
              error: (err) => {
                this.dismissLoading();
                this.component.toastMessage(`${ err.status }: ${ err.error.error }`, 'danger');
              },
              complete: () => {
                this.dismissLoading();
                this.modalCtrl.dismiss('Wrapped Up!');
              }
            });
        } else {
          this.alertCtrl.create({
            header: 'Adding new exam schedule',
            subHeader:
              'Are you sure you want to add new exam schedule with the following details:',
            message: `<p><strong>Publication Date: </strong> ${bodyObject.from_date} - ${bodyObject.till_date}</p>
                      <p><strong>Module: </strong>${bodyObject.module}</p>
                      <p><strong>Start Date: </strong>${bodyObject.dateday}</p>
                      <p><strong>End Date: </strong>${bodyObject.datedayend}</p>
                      <p><strong>Time: </strong> ${bodyObject.time}</p>
                      <p><strong>Duration: </strong> ${this.examDuration}</p>
                      <p><strong>Assessment Type: </strong> ${bodyObject.assessment_type} </p>
                      <p><strong>Remarks: </strong> ${bodyObject.remarks} </p>`,
            buttons: [
              {
                text: 'No',
                handler: () => { }
              },
              {
                text: 'Yes',
                handler: () => {
                  this.presentLoading();
                  const body = new HttpParams({ fromObject: { ...bodyObject } }).toString();
                  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                  this.ws.post('/exam/create_exam_schedule', { body, headers }).subscribe({
                    next: () => {
                      this.component.toastMessage('Exam Schedule added successfully!', 'success');
                    },
                    error: (err) => {
                      this.dismissLoading();
                      this.component.toastMessage(`${ err.status }: ${ err.error.error }`, 'danger');
                    },
                    complete: () => {
                      this.dismissLoading().then(() => this.modalCtrl.dismiss('Wrapped Up!'));
                    }
                  });
                }
              }
            ]
          }).then(alert => alert.present());
        }
      });
    }
  }

  showDuration() {
    const formattedStartDate = parse(
      this.examScheduleForm.get('startTime').value, 'HH:mm', new Date(this.examScheduleForm.get('date').value)
    );
    const formattedEndDate = parse(
      this.examScheduleForm.get('endTime').value, 'HH:mm', new Date(this.examScheduleForm.get('endDate').value)
    );

    const duration = new ExamDurationPipe().transform(formattedStartDate, formattedEndDate);

    if (isValid(formattedStartDate) && isValid(formattedEndDate)) {
      this.examDuration = duration;
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      spinner: 'dots',
      duration: 5000,
      message: 'Please wait...',
      translucent: true
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    return await this.loading.dismiss();
  }

  closeModal() {
    this.modalCtrl.dismiss(null);
  }

}
