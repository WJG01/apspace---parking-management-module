import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Observable, shareReplay, tap } from 'rxjs';

import { add, format, formatISO, parse, parseISO } from 'date-fns';
import { CalendarComponentOptions } from 'ion2-calendar';

import { DatePickerComponent } from '../../../../components/date-picker/date-picker.component';
import { AddFreeSlotBody, AddFreeSlotReview, Venue } from '../../../../interfaces';
import { ComponentService, SettingsService, WsApiService } from '../../../../services';
import { ReviewSlotsModalPage } from '../review-slots-modal/review-slots-modal.page';
import { duplicateFromTime } from './validators';

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
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  venues$: Observable<Venue[]>;
  venues: Venue[]; // Keep track of venues instead of subscribing many times
  locations = ['New Campus', 'TPM', 'Online'];

  constructor(
    private fb: FormBuilder,
    private settings: SettingsService,
    private modalCtrl: ModalController,
    private ws: WsApiService,
    private component: ComponentService
  ) { }

  ngOnInit() {
    const startDate = formatISO(add(parseISO(this.todaysDate), { days: 1 }), { representation: 'date' });
    const location = this.settings.get('defaultCampus') || 'Online';
    const venue = this.settings.get('defaultVenue') || '';

    this.venues$ = this.ws.get<Venue[]>(`/iconsult/locations?venue=${location}`).pipe(
      tap(v => this.venues = v),
      shareReplay(1)
    );

    this.slotsForm = this.fb.group({
      slotType: [this.consultationType[0].value, [Validators.required]],
      startDate: [startDate, [Validators.required]],
      repeatOn: [[]],
      noOfWeeks: [0],
      endDate: [''],
      location: [location, [Validators.required]],
      venue: [venue, [Validators.required]],
      time: new FormArray([])
    });

    this.addTimeSlot();
  }

  addTimeSlot() {
    const group: FormGroup = this.fb.group({
      slotsTime: ['', [Validators.required, duplicateFromTime]]
    });
    const array = this.slotsForm.get('time') as FormArray;

    array.push(group);
  }

  typeChanged(event) {
    if (event.detail.value === this.consultationType[0].value) {
      this.endDate.setValue('');
      this.repeatOn.setValue([]);
      // Remove validation from all additional when type is single
      this.repeatOn.setValidators(null);
      this.repeatOn.updateValueAndValidity();

      this.endDate.setValidators(null);
      this.endDate.updateValueAndValidity();

      this.noOfWeeks.setValue(0);
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
      this.noOfWeeks.setValidators(Validators.pattern(/^([1-9][0-9]{1,3}){1}?$/));
      this.noOfWeeks.updateValueAndValidity();
      // remove validation from end date when type is weekly repeatd
      this.endDate.setValidators(null);
      this.endDate.updateValueAndValidity();
    }
    if (event.detail.value === this.consultationType[2].value) {
      // add validation when type is single slot
      this.repeatOn.setValidators(Validators.required);
      this.repeatOn.updateValueAndValidity();
      // add validation when type is single slot
      this.endDate.setValidators(Validators.required);
      this.endDate.updateValueAndValidity();

      // remove validation from number of weeks when type is date range
      this.noOfWeeks.setValue(0);
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
      this.getTimeControl(i).setValue(data?.time);
      return;
    }
    // Show error message when no time is selected
    this.getTimeControl(i).markAsTouched();
  }

  removeTimeSlot(i: number) {
    const timeArray = this.slotsForm.get('time') as FormArray;
    timeArray.removeAt(i);
  }

  locationChanged(event) {
    // Get new Venues list when location is changed
    const venue = event.detail.value;

    this.venue.setValue('');
    this.venues$ = this.ws.get<Venue[]>(`/iconsult/locations?venue=${venue}`).pipe(
      tap(v => this.venues = v)
    );
  }

  showReview() {
    if (!this.slotsForm.valid) {
      this.slotsForm.markAllAsTouched();
      return;
    }

    const body: AddFreeSlotBody[] = [];
    let startDate: string = this.startDate.value;
    let endDate: string = this.endDate.value;
    // if else: single adding slot, else multiple adding slot.
    if (this.slotType.value === this.consultationType[0].value) {
      this.time.controls.forEach(time => {
        const timeSlot: AddFreeSlotBody = {
          location_id: this.venue.value,
          datetime: startDate + 'T' + format(parse(time.value.slotsTime, 'HH:mm', new Date(startDate)), 'HH:mm:00+0800') // 2019-11-27T17:00:00Z
        };

        body.push(timeSlot);
      });
    } else {
      if (this.noOfWeeks.value > 0) {
        endDate = formatISO(add(parseISO(this.startDate.value),
          { days: (+this.noOfWeeks.value * 7) - 1 }), { representation: 'date' });
      }

      while (startDate <= endDate) {
        const dayName = format(Date.parse(startDate), 'EEEE');
        if (this.repeatOn.value.includes(dayName)) {
          this.time.controls.forEach(time => {
            const timeSlot: AddFreeSlotBody = {
              location_id: this.venue.value,
              datetime: startDate + 'T' + format(parse(time.value.slotsTime, 'HH:mm', new Date(startDate)), 'HH:mm:00+0800') // 2019-11-27T17:00:00Z
            };

            body.push(timeSlot);
          });
        }

        const nextDate = formatISO(add(Date.parse(startDate), { days: 1 }), { representation: 'date' });
        startDate = nextDate;
      }

      if (body.length > 200) {
        this.component.toastMessage('You can only add up to 200 slots at a time.', 'danger');

        return;
      }
    }
    const venue = this.venues.find(v => v.id === this.venue.value);
    const repeat = this.slotType.value === this.consultationType[0].value ? [] : this.repeatOn.value;
    const times = this.time.controls.map(time => format(parse(time.value.slotsTime, 'HH:mm', new Date(startDate)), 'kk:mm'));
    const selectedType = this.consultationType.reduce((acc, type) => ({ ...acc, [type.value]: type.name }), {})
    const reviewData: AddFreeSlotReview = {
      type: selectedType[this.slotType.value],
      startDate: this.startDate.value,
      endDate,
      repeatWeeks: +this.noOfWeeks.value,
      repeat,
      times,
      venue: venue.room_code,
      venueId: this.venue.value,
      location: this.location.value
    }

    this.reviewDetails(reviewData, body);
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

  get startDate(): AbstractControl {
    return this.slotsForm.get('startDate');
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

  getTimeControl(i: number): AbstractControl {
    const schedule = this.slotsForm.get('time') as FormArray;

    return schedule.controls[i].get('slotsTime');
  }

  async reviewDetails(data: AddFreeSlotReview, body: AddFreeSlotBody[]) {
    const modal = await this.modalCtrl.create({
      component: ReviewSlotsModalPage,
      componentProps: {
        data,
        body
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    return modal.present();
  }
}
