import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Observable, shareReplay, tap } from 'rxjs';

import { add, formatISO, parseISO } from 'date-fns';
import { CalendarComponentOptions } from 'ion2-calendar';

import { DatePickerComponent } from '../../../../components/date-picker/date-picker.component';
import { Venue } from '../../../../interfaces';
import { SettingsService, WsApiService } from '../../../../services';

@Component({
  selector: 'app-add-free-slot',
  templateUrl: './add-free-slot.page.html',
  styleUrls: ['./add-free-slot.page.scss'],
})
export class AddFreeSlotPage implements OnInit {

  slotsForm: FormGroup;
  consultationType = [
    { name: 'Single Slot', value: 'repeatnone' },
    { name: 'Weekly Repeated Slots', value: 'repeatweekly' },
    { name: 'Date Range', value: 'repeatnddate' }
  ];
  todaysDate = new Date().toISOString();
  // Options for the ion-calendar (start date)
  mainDateOptions: CalendarComponentOptions = {
    from: add(parseISO(this.todaysDate), { days: 1 }),
    to: add(parseISO(this.todaysDate), { days: 1, months: 1 }),
    disableWeeks: [0]
  };
  // Options for the ion-calendar (end date)
  repeatUntilDateOptions: CalendarComponentOptions = {
    from: add(parseISO(this.todaysDate), { days: 2 }),
    to: add(parseISO(this.todaysDate), { days: 1, months: 12 })
  };
  days = [
    { name: 'Monday', value: 'Mon' },
    { name: 'Tuesday', value: 'Tue' },
    { name: 'Wednesday', value: 'Wed' },
    { name: 'Thursday', value: 'Thu' },
    { name: 'Friday', value: 'Fri' },
    { name: 'Saturday', value: 'Sat' }
  ];
  venues$: Observable<Venue[]>;
  locations = ['New Campus', 'TPM', 'Online'];

  constructor(
    private fb: FormBuilder,
    private settings: SettingsService,
    private modalCtrl: ModalController,
    private ws: WsApiService
  ) { }

  ngOnInit() {
    const startDate = formatISO(add(parseISO(this.todaysDate), { days: 1 }), { representation: 'date' });
    const location = this.settings.get('defaultCampus') || 'Online';
    const venue = this.settings.get('defaultVenue') || {};

    this.venues$ = this.ws.get<Venue[]>(`/iconsult/locations?venue=${location}`).pipe(shareReplay(1));

    this.slotsForm = this.fb.group({
      slotType: [this.consultationType[0].value, [Validators.required]],
      startDate: [startDate, [Validators.required]],
      repeatOn: [[]],
      noOfWeeks: [0, [Validators.pattern(/[0-9]*/)]],
      endDate: [''],
      location: [location, [Validators.required]],
      venue: [venue, [Validators.required]],
      time: new FormArray([])
    });

    this.addTimeSlot();
  }

  addTimeSlot() {
    const group: FormGroup = this.fb.group({
      slotsTime: ['', [Validators.required]] // TODO: Add Duplicate Time Validator
    });
    const array = this.slotsForm.get('time') as FormArray;

    array.push(group);
  }

  typeChanged(event) {
    if (event.detail.value === this.consultationType[0].value) {
      this.endDate.setValue('');
      this.repeatOn.setValue([]);
      this.noOfWeeks.setValue([]);
      // Remove validation from all additional when type is single
      this.repeatOn.setValidators(null);
      this.repeatOn.updateValueAndValidity();

      this.endDate.setValidators(null);
      this.endDate.updateValueAndValidity();

      this.noOfWeeks.setValidators(null);
      this.noOfWeeks.updateValueAndValidity();
    }
    if (event.detail.value === this.consultationType[1].value) {
      this.endDate.setValue('');
      // add validation when type is single slot
      this.repeatOn.setValidators(Validators.required);
      this.repeatOn.updateValueAndValidity();
      // add validation when type is single slot
      this.noOfWeeks.setValidators(Validators.required);
      this.noOfWeeks.updateValueAndValidity();
      // remove validation from end date when type is weekly repeatd
      this.endDate.setValidators(null);
      this.endDate.updateValueAndValidity();
    }
    if (event.detail.value === this.consultationType[2].value) {
      this.noOfWeeks.setValue([]);
      // add validation when type is single slot
      this.repeatOn.setValidators(Validators.required);
      this.repeatOn.updateValueAndValidity();
      // add validation when type is single slot
      this.endDate.setValidators(Validators.required);
      this.endDate.updateValueAndValidity();

      // remove validation from number of weeks when type is date range
      this.noOfWeeks.setValidators(null);
      this.noOfWeeks.updateValueAndValidity();
    }
  }

  mainDateChanged(event) {
    // Calculate the range of date the user can select when the start date is changed
    // applicable only when the slot type is range
    if (this.slotType.value === this.consultationType[2].value) {
      this.repeatUntilDateOptions = {
        from: add(parseISO(event), { days: 1 }),
        to: add(parseISO(this.todaysDate), { days: 1, months: 12 })
      };
      // Set the end date to the first available day
      this.endDate.setValue(formatISO(add(parseISO(event), { days: 1 }), { representation: 'date' }));
    }
  }

  async openPicker(i: number) {
    const hourValues = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const minuteValues = [0, 30];

    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'time',
        hourValues,
        minuteValues,
        hourCycle: 'h23'
      },
      cssClass: 'date-picker-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.time) {
      this.getTimeControl(i, 'slotsTime').setValue(data?.time);
    }
  }

  removeTimeSlot(i: number) {
    const timeArray = this.slotsForm.get('time') as FormArray;
    timeArray.removeAt(i);
  }

  locationChanged(event) {
    // When the user changes the location, get the list of venues again
    this.venue.setValue('');
    // this.venueFieldDisabled = true;
    this.venues$ = this.ws.get<Venue[]>(
      `/iconsult/locations?venue=${event.detail.value}`
    ).pipe(tap(c => console.log(c)));
  }

  submit() {
    console.log(this.slotsForm.value);
  }

  get slotType(): AbstractControl {
    return this.slotsForm.get('slotType');
  }

  get repeatOn(): AbstractControl {
    return this.slotsForm.get('repeatOn');
  }

  get noOfWeeks(): AbstractControl {
    return this.slotsForm.get('noOfWeeks');
  }

  get endDate(): AbstractControl {
    return this.slotsForm.get('endDate');
  }

  get location(): AbstractControl {
    return this.slotsForm.get('location');
  }

  get venue(): AbstractControl {
    return this.slotsForm.get('venue');
  }

  get time(): FormArray {
    return this.slotsForm.get('time') as FormArray;
  }

  getTimeControl(i: number, control: string): AbstractControl {
    const schedule = this.slotsForm.get('time') as FormArray;

    return schedule.controls[i].get(control);
  }
}
