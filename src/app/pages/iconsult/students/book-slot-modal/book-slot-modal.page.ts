import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertButton, LoadingController, ModalController } from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';

import { ConsultationSlot, StaffDirectory } from '../../../../interfaces';
import { ComponentService, WsApiService } from '../../../../services';
import { DateWithTimezonePipe } from '../../../../shared/date-with-timezone/date-with-timezone.pipe';

@Component({
  selector: 'app-book-slot-modal',
  templateUrl: './book-slot-modal.page.html',
  styleUrls: ['./book-slot-modal.page.scss'],
})
export class BookSlotModalPage implements OnInit {

  @Input() slotDetails: ConsultationSlot;
  @Input() staffDetails: StaffDirectory;
  bookForm: FormGroup;
  consultationOptions = [
    'Lecturer',
    'Masters Supervisor',
    'Doctoral Supervisor',
    'Internship Supervisor',
    'FYP Supervisor',
    'Academic Mentor',
    'Programme Leader',
    'Head of School',
    'Dean',
    'Registrar',
    'Manager Student Relations',
  ];
  studentEmail: string;
  textFieldMaxlength = 128;

  constructor(
    private fb: FormBuilder,
    private storage: Storage,
    private component: ComponentService,
    private ws: WsApiService,
    private dateWithTimezonePipe: DateWithTimezonePipe,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.storage.get('/student/profile').then(student => this.studentEmail = student.STUDENT_EMAIL);

    this.bookForm = this.fb.group({
      slot_id: [0, [Validators.required]],
      consultation_with: ['', [Validators.required, Validators.maxLength(this.textFieldMaxlength)]],
      additional_note: ['', [Validators.maxLength(this.textFieldMaxlength)]], // Field is optional
      reason: ['', [Validators.required]]
    });

    this.bookForm.patchValue({
      slot_id: this.slotDetails.slot_id
    });
  }

  submit() {
    if (!this.bookForm.valid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const date = this.dateWithTimezonePipe.transform(this.slotDetails.start_time, 'EEEE, dd MMMM yyyy');
    const time = `${this.dateWithTimezonePipe.transform(this.slotDetails.start_time, 'time').slice(0, -8)} - ${this.dateWithTimezonePipe.transform(this.slotDetails.end_time, 'time').slice(0, -8)}`;
    const message =
      `Are you sure you want to <b class="glob-success-text">Book</b> the following consultation hour?<br>
      <p><strong>Name: </strong>${this.staffDetails.FULLNAME}</p>
      <p><strong>Date: </strong> ${date}</p>
      <p><strong>Time: </strong> ${time} </p>
      `;
    const btn: AlertButton = {
      text: 'Yes',
      handler: async () => {
        const loading = await this.loadingCtrl.create({
          message: 'Please wait...'
        });
        await loading.present();

        this.ws.post('/iconsult/booking', { body: this.bookForm.value }).subscribe({
          next: () => {
            this.component.toastMessage('Slot has been successfully booked!', 'success');
          },
          error: (err) => {
            loading.dismiss();
            this.component.toastMessage(`${err.error.error}`, 'danger');
          },
          complete: () => {
            loading.dismiss();
            this.modalCtrl.dismiss({ completed: true });
          }
        });
      }
    }

    this.component.alertMessage('Confirm Booking', message, 'No', btn);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  get consultationWith(): AbstractControl {
    return this.bookForm.get('consultation_with');
  }

  get additionalNote(): AbstractControl {
    return this.bookForm.get('additional_note');
  }

  get reason(): AbstractControl {
    return this.bookForm.get('reason');
  }
}
