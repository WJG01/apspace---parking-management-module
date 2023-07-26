/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DatePickerComponent } from 'src/app/components/date-picker/date-picker.component';
import { ChangeDetectorRef } from '@angular/core';
import { StudentTimetable } from 'src/app/interfaces/student-timetable';
import moment from 'moment';
import { ComponentService } from 'src/app/services/component.service';
import { BookParkingService } from 'src/app/services/parking-book.service';
import { Storage } from '@ionic/storage-angular';
import { DatePipe } from '@angular/common';


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
    { key: 'APIIT-G', value: 'Zone G - APIIT' }
  ];

  filterObject = {
    parkinglocation: null,
    parkingdate: '',
    starttime: '',
    endtime: '',
  };

  timetables$: Observable<StudentTimetable[]>;
  selectedDate: string;
  showDatePickerFlag = false;

  chosenParkingSpot = '----';
  chosenParkingDate = '----';
  chosenStartTime = '----';
  chosenEndTime = '----';
  chosenDuration = '----';
  selectedParking = '';

  currentLoginUserID = '';


  constructor(
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private component: ComponentService,
    private bookps: BookParkingService,
    private loadingCtrl: LoadingController,
    public modalController: ModalController,
    private storage: Storage,
    private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef,


  ) { }

  ngOnInit() {
    this.doRefresh();
    this.getUserData();
  }

  doRefresh(refresher?) {
    this.getAllBookings();

    if (refresher) {
      refresher.target.complete();
    }
  }

  async getUserData() {
    const userData = await this.storage.get('userData');
    if (userData) {
      this.currentLoginUserID = userData.parkinguserid;
    }
  }



  getAllBookings() {
    this.bookps.getAllBookedParkings().subscribe(
      (response: any) => {
        this.bookedParkings = response; // Store the response in the variable
        console.log('result', this.bookedParkings);
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
    if (!this.filterObject.parkinglocation && this.locations.length > 0) {
      this.filterObject.parkinglocation = this.locations[0].key;
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
      this.filterObject.parkingdate = data.date;
      this.checkAllFieldsFilled();
    }
  }

  async openPicker(type: string) {
    //const hourValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    const modal = await this.modalCtrl.create({
      component: DatePickerComponent,
      componentProps: {
        presentationMode: 'time',
        selected: type,
        //hourValues,
        hourCycle: 'h23', // TODO: Probably show hour format based on user settings
        minuteValues: ['00', '30']
      },
      cssClass: 'date-picker-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    console.log('checking what data passes in modal', data);

    if (data?.selected === 'start') {
      this.filterObject.starttime = data?.time;

      const since = +data?.time.replace(':', '');
      const until = +this.filterObject.endtime.replace(':', '');

      if (until <= since) {
        let newUntil = since + 100; // Add 1 Hour
        console.log('What is newUntil value', newUntil);
        if (newUntil >= 2400) { newUntil = 0; } // Handle case where newUntil is 00:00
        const hh = ('0' + Math.trunc(newUntil / 100)).slice(-2);
        const mm = ('0' + newUntil % 100).slice(-2);
        console.log('filterObject.endtime before', `${hh}:${mm}`);
        this.filterObject.endtime = `${hh}:${mm}`;
        console.log('filterObject.endtime', this.filterObject.endtime);
      }

    }

    if (data?.selected === 'to') {
      this.filterObject.endtime = data?.time;
      console.log('filterObject.endtime', this.filterObject.endtime);

      const since = +this.filterObject.starttime.replace(':', '');
      console.log('what is inside since huh', since);
      const until = +data.time.replace(':', '');

      if (until <= since) {
        let newSince = until - 100; // Minus 1 Hour
        console.log('What is newSince value', newSince);
        if (newSince < 0) { newSince = 2300; } // Handle case where newSince is 23:00
        const hh = ('0' + Math.trunc(newSince / 100)).slice(-2);
        const mm = ('0' + newSince % 100).slice(-2);
        this.filterObject.starttime = `${hh}:${mm}`;
        console.log('filterObject.starttime', this.filterObject.starttime);
      }

    }

    // Manually trigger change detection
    this.changeDetectorRef.detectChanges();
    //this.checkAllFieldsFilled();
  }

  isFilterSet(): boolean {
    // Check if all filter items are set (e.g., location, date, start, end)
    return (
      this.filterObject.parkinglocation !== '' &&
      this.filterObject.parkingdate !== '' &&
      this.filterObject.starttime !== '' &&
      this.filterObject.endtime !== ''
    );
  }

  async checkAllFieldsFilled() {
    this.selectedParking = null;
    this.availableParkings = [];
    this.chosenParkingDate = '';
    this.chosenStartTime = '';
    this.chosenParkingSpot = '';
    this.chosenEndTime = '';
    this.chosenDuration = '';

    // Check if all fields have values
    console.log(this.filterObject);
    if (this.filterObject.parkinglocation && this.filterObject.parkingdate && this.filterObject.starttime && this.filterObject.endtime) {
      // Validate start and end times
      const startTime = Number(this.filterObject.starttime.replace(':', ''));
      const endTime = Number(this.filterObject.endtime.replace(':', ''));
      if (endTime < startTime) {
        // Reset the end time to the same value as the start time
        this.filterObject.endtime = this.filterObject.starttime;
      }

      if (!this.foundExistingBookingByUser()) {
        this.availableParkings = this.loadVacantParking();
        console.log(this.availableParkings);
      } else {
        this.component.alertMessage('Warning', 'Found an existing booking made by you earlier!', 'danger');
      }
    } else {
      // Clear the available parking spots if filters are not set
      this.availableParkings = [];
    }

    // Trigger change detection to update the template
    this.cdr.detectChanges();
  }

  foundExistingBookingByUser(): boolean {

    console.log('at this point', this.currentLoginUserID);
    const currentUserBookings = this.bookedParkings.selectParkingResponse.filter(booking =>
      booking.userid === this.currentLoginUserID
    );

    const chosenFromTimeObj = new Date(`2000-01-01T${this.filterObject.starttime}`);
    chosenFromTimeObj.setMinutes(chosenFromTimeObj.getMinutes() - 10); // Apply 10-minute buffer
    const chosenToTimeObj = new Date(`2000-01-01T${this.filterObject.endtime}`);

    for (const booking of currentUserBookings) {
      const bookingFromTime = new Date(`2000-01-01T${booking.starttime}`);
      const bookingToTime = new Date(`2000-01-01T${booking.endtime}`);

      if (
        booking.parkingdate === this.filterObject.parkingdate &&
        (
          (chosenFromTimeObj >= bookingFromTime && chosenFromTimeObj <= bookingToTime) || // Chosen start time overlaps
          (chosenToTimeObj >= bookingFromTime && chosenToTimeObj <= bookingToTime) || // Chosen end time overlaps
          // Chosen time range completely contains the existing booking
          (chosenFromTimeObj <= bookingFromTime && chosenToTimeObj >= bookingToTime)
        )
      ) {
        console.log('Existing booking found made by you!');
        return true;
      }
    }

    return false;
  }

  findOccupiedParking(): string[] {
    const occupiedParking: string[] = [];

    this.bookedParkings.selectParkingResponse.forEach(booking => {
      const bookingFromTime = new Date(`2000-01-01T${booking.starttime}`);
      const bookingToTime = new Date(`2000-01-01T${booking.endtime}`);
      const chosenFromTimeObj = new Date(`2000-01-01T${this.filterObject.starttime}`);
      const chosenToTimeObj = new Date(`2000-01-01T${this.filterObject.endtime}`);

      if (
        booking.parkinglocation === this.filterObject.parkinglocation &&
        booking.parkingdate === this.filterObject.parkingdate &&
        (
          // Chosen start time overlaps
          (chosenFromTimeObj >= bookingFromTime && chosenFromTimeObj <= bookingToTime) ||

          // Chosen end time overlaps
          (chosenToTimeObj >= bookingFromTime && chosenToTimeObj <= bookingToTime) ||

          // Chosen time range completely contains the existing booking
          (chosenFromTimeObj <= bookingFromTime && chosenToTimeObj >= bookingToTime)
        )
      ) {
        occupiedParking.push(booking.parkingspotid);
      }
    });

    return occupiedParking;
  }

  loadVacantParking(): string[] {
    const totalSpots = 20;
    const chosenLocation = this.filterObject.parkinglocation;
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
    this.chosenParkingDate = `${this.filterObject.parkingdate}`;
    this.chosenStartTime = `${this.filterObject.starttime}`;
    this.chosenEndTime = `${this.filterObject.endtime}`;

    // Calculate duration
    const startTime = moment(this.filterObject.starttime, 'HH:mm');
    const endTime = moment(this.filterObject.endtime, 'HH:mm');
    const duration = moment.duration(endTime.diff(startTime));
    const hours = duration.hours();
    const minutes = duration.minutes();
    this.chosenDuration = `${hours} hours ${minutes} minutes`;
  }


  private generateOTP(): string {
    const digits = 3; // Number of digits in the OTP
    let otp = '';
    for (let i = 0; i < digits; i++) {
      otp += Math.floor(Math.random() * 10); // Generate a random number between 0 and 9
    }
    return otp;
  }

  confirmBooking() {
    this.presentLoading();
    const location_parkingspotid = this.chosenParkingSpot;
    const parts = location_parkingspotid.split('-');
    const currentDate = new Date();
    const datePipe = new DatePipe('en-US');
    const formattedDateTime = datePipe.transform(currentDate, 'yyyy-MM-ddTHH:mm:ss');
    const otp = this.generateOTP();

    const body = {
      parkinglocation: this.filterObject.parkinglocation,
      parkingspotid: parts[2],
      parkingdate: this.chosenParkingDate,
      starttime: this.chosenStartTime,
      endtime: this.chosenEndTime,
      userid: this.currentLoginUserID,
      parkingstatus: 'BOOKED',
      bookingcreateddatetime: formattedDateTime,
      checkincode: otp
    };

    const headers = { 'Content-Type': 'application/json' };

    if (body) {
      this.bookps.createNewParkingBooking(body, headers).subscribe({
        next: () => {
          this.component.toastMessage(`Successfully Booked Parking Spot ${this.chosenParkingSpot} !`, 'success').then(() => {
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
    this.filterObject.parkinglocation = null;
    this.filterObject.parkingdate = '';
    this.filterObject.starttime = '';
    this.filterObject.endtime = '';
    this.availableParkings = [];
    this.selectedParking = null;
    this.chosenParkingSpot = '----';
    this.chosenParkingDate = '----';
    this.chosenStartTime = '----';
    this.chosenEndTime = '----';
    this.chosenDuration = '-';
    this.filterObject.parkinglocation = null;
  }

}
