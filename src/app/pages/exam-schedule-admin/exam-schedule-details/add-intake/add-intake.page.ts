import { Component, Input, OnInit } from '@angular/core';
import { addYears, format } from 'date-fns';
import { IntakeExamSchedule } from '../../../../interfaces/exam-schedule-admin';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController, PopoverController } from '@ionic/angular';
import { ComponentService, WsApiService } from '../../../../services';
import { tap } from 'rxjs';
import { SearchModalComponent } from '../../../../components/search-modal/search-modal.component';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-add-intake',
  templateUrl: './add-intake.page.html',
  styleUrls: ['./add-intake.page.scss'],
})
export class AddIntakePage implements OnInit {
  @Input() onEdit: boolean;
  @Input() intakeDetails: IntakeExamSchedule;
  @Input() examId: any;
  @Input() intakesToBeValidated: any;

  loading: HTMLIonLoadingElement;


  intakeForm: FormGroup;
  intakes = [];

  venues = [
    'EXAM HALL@APIIT',
    'APU@EXAM HALL',
    'Microsoft Teams(Online)',
    'Moodle'
  ];

  types = [
    'First',
    'Resit'
  ];

  // devUrl = 'https://swze54usn5.execute-api.ap-southeast-1.amazonaws.com/dev';

  nextYears = format(addYears(new Date(), 3), 'yyyy');


  constructor(
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public component: ComponentService,
    private formBuilder: FormBuilder,
    private ws: WsApiService
  ) {}

  ngOnInit() {
    this.ws.get<any>('/exam/intake_listing').pipe(
      tap(intakes => {
        intakes.forEach(intake => this.intakes.push(intake.COURSE_CODE_ALIAS));
      })
    ).subscribe();
    this.initializeForm(this.intakeDetails);
  }

  initializeForm(intakeDetails: IntakeExamSchedule = {
    DOCKETSDUE: '',
    ENTRYID: '',
    INTAKE: '',
    RESULT_DATE: '',
    TYPE: '',
    VENUE: ''
  }) {
    this.intakeForm = this.formBuilder.group({
      intake: this.initializeIntake(intakeDetails.INTAKE),
      type: [intakeDetails.TYPE],
      // location: [location],
      venue: [intakeDetails.VENUE, Validators.required],
      docketIssuance: [intakeDetails.DOCKETSDUE],
      examResultDate: [intakeDetails.RESULT_DATE, Validators.required]
    });
  }

  initializeIntake(intake) {
    if (!(this.onEdit)) {
      return this.formBuilder.array([], [Validators.required]);
    } else {
      return [intake, Validators.required];
    }
  }

  async presentIntakeSearch() {
    const popover = await this.popoverCtrl.create({
      component: SearchModalComponent,
      cssClass: 'glob-popover',
      componentProps: {
        items: this.intakes,
        isModal: false,
        notFound: 'No intake selected'
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data && data.data.item) {
        if (this.intakesToBeValidated.includes(data.data.item) || this.intakeArray.value.includes(data.data.item)) {
          this.component.toastMessage(
            'You cannot create duplicate intakes entry with the same intake.',
            'danger'
          );
          return;
        }

        if (this.onEdit) {
          this.intakeForm.get('intake').patchValue(data.data.item);
        } else {
          this.intakeArray.push(this.formBuilder.control(data.data.item));
        }
      }
    });
    return await popover.present();
  }

  addSelectedIntakes(intakeObject: any) {
    if (!(this.intakeArray.value.find(intake => intake.value === intakeObject.value))) {
      this.intakeArray.push(this.formBuilder.group({
        value: [intakeObject.value, Validators.required],
      }));
    } else {
      this.intakeArray.removeAt(this.intakeArray.value.findIndex(intake => intake.value === intakeObject.value));
    }
  }

  removeIntake(i) {
    this.intakeArray.removeAt(i);
  }

  get intakeArray() {
    return this.intakeForm.get('intake') as FormArray;
  }

  submit() {
    if (this.intakeForm.valid) {
      const bodyObject = {
        exam_id: this.examId,
        docketsdue: this.intakeForm.get('docketIssuance').value ?
          format(new Date(this.intakeForm.get('docketIssuance').value), 'dd-MMM-yyyy').toUpperCase() : '',
        appraisalsdue: '',
        createdby: '',
        types: this.intakeForm.get('type').value ? this.intakeForm.get('type').value : '',
        venue: `${this.intakeForm.get('venue').value}`,
        intake_group: '',
        result_date: format(new Date(this.intakeForm.get('examResultDate').value), 'dd-MMM-yyyy').toUpperCase()
      };

      if (this.onEdit) {
        const entryIdAndIntake = { entryid: this.intakeDetails.ENTRYID, intake: this.intakeForm.get('intake').value };
        this.presentLoading();
        const body = new HttpParams({ fromObject: { ...entryIdAndIntake, ...bodyObject } }).toString();
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        this.ws.post<any>('/exam/update_intake_entry', {
          body,
          headers
        })
          .subscribe({
            next: () => {
              this.component.toastMessage(
                'Intake updated successfully!',
                'success'
              );
            },
            error: (err) => {
              this.dismissLoading();
              this.component.toastMessage(
                err.status + ': ' + err.error.error,
                'danger'
              );
            },
            complete: () => {
              this.dismissLoading().then(() => this.modalCtrl.dismiss('Wrapped Up!'));
            }
          });
      } else {
        const bodyArray = {'intakes[]' : []};
        const intakesMessage = this.intakeArray.value.join(', ');

        this.intakeArray.value.forEach(intake => {
          bodyArray['intakes[]'].push(intake);
        });

        this.alertCtrl.create({
          header: 'Adding new intakes',
          subHeader:
            'Are you sure you want to add new intakes with the following details:',
          message: `<p><strong>Intake: </strong> ${intakesMessage}</p>
                    <p><strong>Type: </strong>${bodyObject.types}</p>
                    <p><strong>Venue: </strong>${bodyObject.venue}</p>
                    <p><strong>Docket Issuance: </strong> ${bodyObject.docketsdue}</p>
                    <p><strong>Exam Result Date: </strong> ${bodyObject.result_date} </p>`,
          buttons: [
            {
              text: 'No',
              handler: () => { }
            },
            {
              text: 'Yes',
              handler: () => {
                this.presentLoading();
                const body = new HttpParams({ fromObject: { ...bodyArray, ...bodyObject } }).toString();
                const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                this.ws.post('/exam/create_intake_entry', {
                  body,
                  headers
                }).subscribe({
                  next: () => {
                    this.component.toastMessage(
                      'Intakes added successfully!',
                      'success'
                    );
                  },
                  error: (err) => {
                    this.dismissLoading();
                    this.component.toastMessage(
                      err.status + ': ' + err.error.error,
                      'danger'
                    );
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
