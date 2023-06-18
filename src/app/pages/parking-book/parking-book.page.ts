import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap, map, finalize } from 'rxjs/operators';
import { DatePickerComponent } from 'src/app/components/date-picker/date-picker.component';
import { ChangeDetectorRef } from '@angular/core';
import { StudentTimetable } from 'src/app/interfaces/student-timetable';
import { StudentTimetableService } from 'src/app/services/student-timetable.service';
import parkingData from './parkingDummy.json';
import moment from 'moment';
import { ParkingWsApiService } from 'src/app/services/parking_module-ws-api.service';
import { ComponentService } from 'src/app/services/component.service';
import { BookParkingService } from 'src/app/services/book-parking.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-parking-book',
  templateUrl: './parking-book.page.html',
  styleUrls: ['./parking-book.page.scss'],
})


export class BookParkingPage implements OnInit {

  loading: HTMLIonLoadingElement;
  bookedParkings: any;
  availableParkings: string[] = [];

  locations = [
    { key: 'APU-A', value: 'Zone A - APU' },
    { key: 'APU-B', value: 'Zone B - APU' },
    { key: 'APIIT-A', value: 'Zone A - APIIT' },
    { key: 'APIIT-G', value: 'Zone G - APIIT' }
  ];

  filterObject = {
    location: null,
    date: '',
    from: '',
    to: '',
  };

  timetables$: Observable<StudentTimetable[]>;
  selectedDate: string;
  showDatePickerFlag = false;

  chosenParkingSpot = '----';
  chosenParkingDate= '----';
  chosenStartTime= '----';
  chosenEndTime= '----';
  chosenDuration= '----';
  selectedParking: string;


  constructor(
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private component: ComponentService,
    private bookps: BookParkingService,
    private loadingCtrl: LoadingController,
    public modalController: ModalController,
    private router: Router


  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    this.getAllBookings();

    if (refresher) {
      refresher.target.complete();
    }
  }



  getAllBookings() {
    this.bookps.getAllBookedParkings().subscribe(
      (response: any) => {
        this.bookedParkings = response; // Store the response in the variable
        console.log('result', this.bookedParkings)
      },
      (error: any) => {
        console.log(error);
      }
    );
  }


  showDatePicker() {
    this.showDatePickerFlag = true;
  }

  hideDatePicker() {
    this.showDatePickerFlag = false;
    this.checkAllFieldsFilled();
  }

  // Component code
  loadLocations() {
    if (!this.filterObject.location && this.locations.length > 0) {
      this.filterObject.location = this.locations[0].key;
    }
  }


  async openDatePicker(type: string) {
    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'date',
      },
      cssClass: 'date-picker-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    // Handle the returned data from the date picker modal
    if (data?.date) {
      // Update the selected date based on the returned data
      this.filterObject.date = data.date;
      this.checkAllFieldsFilled();
    }
  }

  async openPicker(type: string) {
    const hourValues = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'time',
        selected: type,
        hourValues,
        hourCycle: 'h23' // TODO: Probably show hour format based on user settings
      },
      cssClass: 'date-picker-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.selected === 'start') {
      const since = +data?.time.replace(':', '');
      const until = +this.filterObject.to.replace(':', '');

      if (until < since) {
        const newUntil = since + 100; // Add 1 Hour
        const hh = ('0' + Math.trunc(newUntil / 100)).slice(-2);
        const mm = ('0' + newUntil % 100).slice(-2);
        this.filterObject.to = `${hh}:${mm}`;
      }
      this.filterObject.from = data?.time;
    }

    if (data?.selected === 'to') {
      const since = +this.filterObject.from.replace(':', '');
      const until = +data.time.replace(':', '');

      if (until < since) {
        const newSince = until - 100; // Minus 1 Hour
        const hh = ('0' + Math.trunc(newSince / 100)).slice(-2);
        const mm = ('0' + newSince % 100).slice(-2);
        this.filterObject.from = `${hh}:${mm}`;
      }
      this.filterObject.to = data?.time;
    }
    this.checkAllFieldsFilled();
  }

  isFilterSet(): boolean {
    // Check if all filter items are set (e.g., location, date, start, end)
    return (
      this.filterObject.location !== '' &&
      this.filterObject.date !== '' &&
      this.filterObject.from !== '' &&
      this.filterObject.to !== ''
    );
  }

  checkAvailabilityOnChange(): void {
    if (this.isFilterSet()) {
      // Perform the logic to check available parking spots based on the selected filters
      this.availableParkings = this.loadVacantParking();
      //.filter(parking => this.filterParking(parking));
    } else {
      // Clear the available parking spots if filters are not set
      this.availableParkings = [];
    }
  }

  checkAllFieldsFilled() {
    this.selectedParking = null;
    this.availableParkings = [];
    this.chosenParkingDate = '';
    this.chosenStartTime = '';
    this.chosenParkingSpot = '';
    this.chosenEndTime = '';
    this.chosenDuration = '';

    // Check if all fields have values
    console.log(this.filterObject);
    if (this.filterObject.location && this.filterObject.date && this.filterObject.from && this.filterObject.to) {
      this.availableParkings = this.loadVacantParking();
      console.log(this.availableParkings);
    } else {
      // Clear the available parking spots if filters are not set
      this.availableParkings = [];
    }

    // Trigger change detection to update the template
    this.cdr.detectChanges();
  }

  findOccupiedParking(): string[] {
    const occupiedParking: string[] = [];

    console.log('in other place', this.bookedParkings);
    console.log('checking_filterObject.location', this.filterObject.location);


    this.bookedParkings.selectParkingResponse.forEach(booking => {
      const bookingFromTime = new Date(`2000-01-01T${booking.from}`);
      const bookingToTime = new Date(`2000-01-01T${booking.to}`);
      const chosenFromTimeObj = new Date(`2000-01-01T${this.filterObject.from}`);
      const chosenToTimeObj = new Date(`2000-01-01T${this.filterObject.to}`);

      if (
        booking.location === this.filterObject.location &&
        booking.date === this.filterObject.date &&
        (
          (chosenFromTimeObj >= bookingFromTime && chosenFromTimeObj <= bookingToTime) || // Chosen start time overlaps
          (chosenToTimeObj >= bookingFromTime && chosenToTimeObj <= bookingToTime) || // Chosen end time overlaps
          // Chosen time range completely contains the existing booking
          (chosenFromTimeObj <= bookingFromTime && chosenToTimeObj >= bookingToTime)
        )
      ) {
        occupiedParking.push(booking.parkingspotid);
      }
    });

    console.log('hello this is occupiedparking',occupiedParking);
    return occupiedParking;
  }

  loadVacantParking(): string[] {
    const totalSpots = 20;
    const chosenLocation = this.filterObject.location;
    //const bookedSpots = this.findOccupiedParking();
    // Generate an array of available spots by excluding the booked locations
    const availableSpots = Array.from({ length: totalSpots }, (_, index) => {
      const spotNumber = (index + 1).toString().padStart(2, '0');
      return spotNumber;
    }).filter(spot => !this.findOccupiedParking().includes(spot))
      .map(spot => `${chosenLocation}-${spot}`);
    return availableSpots;
  }

  fillBookingDetails(parkingSpot: string) {
    this.selectedParking = parkingSpot;
    this.chosenParkingSpot = `${parkingSpot}`;
    this.chosenParkingDate = `${this.filterObject.date}`;
    this.chosenStartTime = `${this.filterObject.from}`;
    this.chosenEndTime = `${this.filterObject.to}`;

    // Calculate duration
    const startTime = moment(this.filterObject.from, 'HH:mm');
    const endTime = moment(this.filterObject.to, 'HH:mm');
    const duration = moment.duration(endTime.diff(startTime));
    const hours = duration.hours();
    const minutes = duration.minutes();
    this.chosenDuration = `${hours} hours ${minutes} minutes`;
  }


  confirmBooking() {
    this.presentLoading();
    const location_parkingspotid = this.chosenParkingSpot;
    const parts = location_parkingspotid.split('-');

    const body = {
      location: this.filterObject.location,
      parkingspotid: parts[2],
      date: this.chosenParkingDate,
      from: this.chosenStartTime,
      to: this.chosenEndTime,
    }

    const headers = { 'Content-Type': 'application/json' };

    if (body) {
      this.bookps.createNewParkingBooking(body, headers).subscribe({
        next: () => {
          this.component.toastMessage(`Successfully Booked Parking Spot ${this.chosenParkingSpot}!`, 'success').then(() => {
            this.dismissLoading();
            this.clearFilter();
            this.doRefresh(); // Reload the page to its initial state
          });
        },
        error: (err) => {
          this.component.toastMessage(err.message, 'danger');
          this.dismissLoading();
        },
      });
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      spinner: 'dots',
      duration: 20000,
      message: 'Loading ...',
      translucent: true,
      animated: true
    });
    return await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      this.dismiss();
      return await this.loading.dismiss();
    }
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  clearFilter() {
    this.filterObject.location = null;
    this.filterObject.date = '';
    this.filterObject.from = '';
    this.filterObject.to = '';
    this.availableParkings = [];
    this.selectedParking = null;
    this.chosenParkingSpot = '----';
    this.chosenParkingDate = '----';
    this.chosenStartTime = '----';
    this.chosenEndTime = '----';
    this.chosenDuration = '-';
    this.filterObject.location = null;
  }

}
