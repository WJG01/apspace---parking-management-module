import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap, map, finalize } from 'rxjs/operators';
import { DatePickerComponent } from 'src/app/components/date-picker/date-picker.component';
import { ChangeDetectorRef } from '@angular/core';
import { StudentTimetable } from 'src/app/interfaces/student-timetable';
import { StudentTimetableService } from 'src/app/services/student-timetable.service';
import parkingData from './parkingDummy.json';

@Component({
  selector: 'app-parking-book',
  templateUrl: './parking-book.page.html',
  styleUrls: ['./parking-book.page.scss'],
})


export class BookParkingPage implements OnInit {

  bookedParkings: any;
  availableParkings: string[] = [];

  locations = [
    { key: 'APU-A', value: 'Zone A - APU' },
    { key: 'APU-B', value: 'Zone B - APU' },
    { key: 'APIIT-A', value: 'Zone A - APIIT' },
    { key: 'APIIT-G', value: 'Zone G - APIIT' }
  ];

  filterObject = {
    location: '',
    date: '',
    from: '',
    to: '',
  };

  timetables$: Observable<StudentTimetable[]>;
  selectedDate: string;
  showDatePickerFlag = false;


  constructor(
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private tt: StudentTimetableService,


  ) { }

  ngOnInit() {
    this.bookedParkings = parkingData;
  }


  showDatePicker() {
    this.showDatePickerFlag = true;
  }

  hideDatePicker() {
    this.showDatePickerFlag = false;
    this.checkAllFieldsFilled();
  }

  doRefresh(refresher?) {
    // const refresh = refresher ? true : false;
    // const excludeRooms = ['ONL', 'Online'];

    // this.timetables$ = this.tt.get(refresh).pipe(
    //   tap(res => console.log(res)),
    //   map(data => data.filter(res => excludeRooms.every(room => !res.ROOM.includes(room)))), // Exclude Online and ONL room data
    //   finalize(() => {
    //     if (refresher) {
    //       refresher.target.complete();
    //     }
    //   })
    // );
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
    // Check if all fields have values
    console.log('Hello');
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
    this.bookedParkings.forEach(booking => {
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

    console.log(occupiedParking);
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


  confirmBooking() {
    //console.log('object', this.parkings);
    //   console.log(this.bookedParkings);
    //   const bookingExists = this.bookedParkings.some(booking => {
    //     const bookingFromTime = new Date(`2000-01-01T${booking.from}`);
    //     const bookingToTime = new Date(`2000-01-01T${booking.to}`);
    //     const chosenFromTimeObj = new Date(`2000-01-01T${this.filterObject.from}`);
    //     const chosenToTimeObj = new Date(`2000-01-01T${this.filterObject.to}`);
    //     return (
    //       booking.location === this.filterObject.location &&
    //       booking.date === this.filterObject.date &&
    //       (
    //         (chosenFromTimeObj >= bookingFromTime && chosenFromTimeObj <= bookingToTime) || // Chosen start time overlaps
    //         (chosenToTimeObj >= bookingFromTime && chosenToTimeObj <= bookingToTime) || // Chosen end time overlaps
    //         // Chosen time range completely contains the existing booking
    //         (chosenFromTimeObj <= bookingFromTime && chosenToTimeObj >= bookingToTime)
    //       )
    //     );
    //   });

    //   if (bookingExists) {
    //     console.log('Booking exists');
    //   } else {
    //     console.log('Booking does not exist');
    //   }

    this.loadVacantParking();
  }

}
