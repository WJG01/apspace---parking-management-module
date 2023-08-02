/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { ComponentService } from 'src/app/services/component.service';
import { BookParkingService } from 'src/app/services/parking-book.service';
import { Storage } from '@ionic/storage-angular';
import { CheckinOTPModalPage } from './checkin-otpmodal/checkin-otpmodal.page';
import { Router } from '@angular/router';
import { first } from 'rxjs';


@Component({
  selector: 'app-parking-history',
  templateUrl: './parking-history.page.html',
  styleUrls: ['./parking-history.page.scss', '../../../theme/custom-library.scss'],
})
export class ParkingHistoryPage implements OnInit {

  loading: HTMLIonLoadingElement;
  selectedSegment: 'ongoingBooking' | 'completedBooking' = 'ongoingBooking';
  parkingRecords: any[] = [];
  parkingRecordsCopy: any[] = [];
  filteredParkingRecords: any[] = [];
  currentLoginUserID = '';
  isMobile: boolean;

  chosenParkingRecord = {
    APQParkingIdDisplay: '---',
    parkingdate: '---',
    starttime: '---',
    endtime: '---',
    parkinglocation: '---',
    parkingspotid: '---',
    parkingstatus: '---',
    bookingcreateddatetime: '---',
  };

  chosenParkingRecordIsSelected = false;


  //filter object data declare
  todaysDate = new Date();

  filterObject = {
    isToday: false,
    year: -1,
    month: -1
  };

  yearRange: number[] = [];
  monthList: { key: string; value: number }[] = [];
  parkingDays: string[] = ['today', 'tomorrow'];

  statusColors: { [status: string]: string } = {
    BOOKED: 'primary',
    CHECKIN: 'warning',
    COMPLETED: 'success'
  };

  existingCheckinRecord = false;




  constructor(
    private bookps: BookParkingService,
    private component: ComponentService,
    private storage: Storage,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController,
    private router: Router,
    private platform: Platform,
    private cdr: ChangeDetectorRef,

  ) {
    this.isMobile = this.platform.is('mobile');
    this.generateYearRange();
    this.generateMonthList();
  }

  ngOnInit() {
    this.getUserData();
    this.doRefresh();

  }

  doRefresh(refresher?) {
    // this.needLoading = true;
    this.getAllBookings();

    if (refresher) {
      refresher.target.complete();
    }
  }

  async getUserData() {
    const userData = await this.storage.get('userData');
    console.log('CurrentUserData', userData);
    if (userData) {
      this.currentLoginUserID = userData.parkinguserid;
      console.log('CurrentUserAcceptingis', this.currentLoginUserID);
    }
  }

  generateYearRange(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      this.yearRange.push(i);
    }
  }

  generateMonthList(): void {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    for (let i = 0; i < 12; i++) {
      this.monthList.push({ key: monthNames[i], value: i + 1 });
    }
  }


  getAllBookings() {
    this.bookps.getAllBookedParkings().subscribe(
      (response: any) => {
        this.parkingRecords = response.selectParkingResponse;
        console.log('All Parking Records', this.parkingRecords);

        const todayDate = new Date();

        //Concantenate parking IDs for all records
        this.parkingRecords.forEach((record: any) => {
          const APQParkingIdDisplay = record.APQParkingID; // Get the APQParkingID from the record
          const firstPart = '#' + APQParkingIdDisplay.split('-')[0]; // Extract the first part before the first hyphen "-"
          record.APQParkingIdDisplay = firstPart;
        });

        // Separate records based on status
        const checkinRecord = this.parkingRecords.find(record => record.parkingstatus === 'CHECKIN' && record.userid === this.currentLoginUserID);
        const booked_completedRecords = this.parkingRecords.filter(record => (record.parkingstatus === 'BOOKED' || record.parkingstatus === 'COMPLETED') && record.userid === this.currentLoginUserID);

        // Create a new property combining parking date and start time as a Date object
        booked_completedRecords.forEach(record => {
          record.parkingDateTime = new Date(`${record.parkingdate} ${record.starttime}`);

          // Update status to 'COMPLETED' for records with a parking date that has passed today's date
          if (record.parkingstatus !== 'COMPLETED' && record.parkingDateTime < todayDate && record.parkingDateTime.toDateString() !== todayDate.toDateString()) {
            record.parkingstatus = 'COMPLETED';
            this.markBookingCompleted(record);
          }
        });

        // Sort ongoingBooking in ascending order
        const ongoingBookingRecords = booked_completedRecords.filter(record => record.parkingstatus === 'CHECKIN' || record.parkingstatus === 'BOOKED');
        ongoingBookingRecords.sort((a, b) => {
          return a.parkingDateTime.getTime() - b.parkingDateTime.getTime();
        });

        // Sort completedBooking in descending order
        const completedBookingRecords = booked_completedRecords.filter(record => record.parkingstatus === 'COMPLETED');
        completedBookingRecords.sort((a, b) => {
          return b.parkingDateTime.getTime() - a.parkingDateTime.getTime();
        });

        // Combine both sections
        this.parkingRecords = [...ongoingBookingRecords, ...completedBookingRecords];

        // Check if checkinRecord exists
        if (checkinRecord) {
          this.existingCheckinRecord = true;
          checkinRecord.parkingDateTime = new Date(`${checkinRecord.parkingdate} ${checkinRecord.starttime}`);
          this.parkingRecords.unshift(checkinRecord);
          this.parkingRecordsCopy = [...this.parkingRecords];
        } else {
          this.parkingRecordsCopy = [...this.parkingRecords];
        }

        console.log('result', this.parkingRecords);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  padNumberWithZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  filterParkingRecords(): void {
    const todayDate = new Date().toISOString().split('T')[0];

    // Create a new array to hold the filtered records
    let filteredParkingRecords = this.parkingRecordsCopy;
    this.parkingRecords = this.parkingRecordsCopy;

    // this.parkingRecords.forEach((record: any) => {
    //   console.log('compare', todayDate, 'vs', record.parkingdate);
    //   console.log('compareDate', todayDate === record.parkingdate);
    // });

    if (this.filterObject.isToday) {
      console.log('today filtering is running now');
      filteredParkingRecords = filteredParkingRecords.filter((record: any) => {
        return record.parkingdate === todayDate;
      });
    } else if (this.filterObject.year !== -1 || this.filterObject.month !== -1) {
      console.log('both filtering is running now');

      if (this.filterObject.year !== -1) {
        console.log('comparing year', this.parkingRecords);
        filteredParkingRecords = filteredParkingRecords.filter((record: any) => {
          const parkingYear = Number(record.parkingdate.split('-')[0]);
          console.log('comparing year', parkingYear, 'vs', this.filterObject.year);

          return parkingYear === this.filterObject.year;
        });
      }

      if (this.filterObject.month !== -1) {
        console.log('month filtering is running now');
        const formattedMonth = this.padNumberWithZero(this.filterObject.month);

        filteredParkingRecords = filteredParkingRecords.filter((record: any) => {
          const parkingMonth = record.parkingdate.split('-')[1];
          console.log('comparing year', parkingMonth, 'vs', this.filterObject.month);
          return parkingMonth === formattedMonth;
        });
      }
    } else {
      // If no filters are selected, set the filtered records to the original array
      console.log('Running no filters showing', filteredParkingRecords);
      //this.getAllBookings();
      filteredParkingRecords = this.parkingRecordsCopy;
    }

    // Now assign the filtered array back to this.parkingRecords
    this.parkingRecords = filteredParkingRecords;

    console.log('checking parking record', this.parkingRecords);
  }




  getDistinctiveIndex(parkingStatus: string, index: number): number {
    let counter = 0;
    let statusCheck: string[] = [];

    if (parkingStatus === 'ongoingBooking') {
      statusCheck = ['CHECKIN', 'BOOKED'];
    } else if (parkingStatus === 'completedBooking') {
      statusCheck = ['COMPLETED'];
    }

    // Iterate through the emergencyReports to count the distinctive index
    for (let i = 0; i <= index; i++) {
      if (statusCheck.includes(this.parkingRecords[i].parkingstatus)) {
        counter++;
      }
    }

    return counter;
  }

  showParkingDetails(parkings: any) {
    this.chosenParkingRecordIsSelected = true;
    this.chosenParkingRecord = parkings;
  }

  async checkoutParking(chosenParking: any) {

    if (chosenParking.parkingstatus === 'CHECKIN') {

      const body = {
        parkingstatus: 'COMPLETED',
        userid: this.currentLoginUserID,
      };
      const headers = { 'Content-Type': 'application/json' };

      const alert = await this.alertController.create({
        header: 'Confirmation',
        message: 'You have to leave this parking within <b><span class="red-text">10 mins</span></b> after checkout ! <br> Proceed?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              // No action needed
            }
          },
          {
            text: 'Yes',
            handler: () => {

              //update emergency report status to HELPFIND, clear security guard id
              if (body) {
                this.presentLoading();
                this.bookps.updateParkingBooking(chosenParking.APQParkingID, body, headers).subscribe(
                  (response: any) => {
                    this.dismissLoading();
                    console.log('Delete Response', response);
                    this.component.toastMessage('Successfully checkout for parking' + chosenParking.parkinglocation + '- ' + chosenParking.parkingspotid, 'success').then(() => {
                      this.clearSelectedField();
                      this.doRefresh();
                    });
                  },
                  (error: any) => {
                    this.dismissLoading();
                    console.log(error);
                  }

                );

              }

            }
          }
        ],
        cssClass: 'custom-alert',
      });

      await alert.present();
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
      return await this.loading.dismiss();
    }
  }


  async markBookingCompleted(parkingRecord: any) {
    if (parkingRecord.parkingstatus === 'BOOKED') {

      const body = {
        parkingstatus: 'COMPLETED'
      };
      const headers = { 'Content-Type': 'application/json' };

      //update emergency report status to HELPFIND, clear security guard id
      if (body) {
        this.bookps.updateParkingBooking(parkingRecord.APQParkingID, body, headers).subscribe(
          (response: any) => {
            console.log('Found and Marked Completed for expired', parkingRecord.APQParkingIdDisplay, ' parking record');
          },
          (error: any) => {
            console.log(error);
          }

        );

      }
    }
  }

  viewInMap(chosenParkingRecord: any) {
    const location = chosenParkingRecord.parkinglocation;
    const parkingspotid = chosenParkingRecord.parkingspotid;

    this.router.navigate(['/parking-map'], {
      queryParams: { location, parkingspotid }
    });
  }

  async getCheckinOTP(chosenParkingRecord: any) {
    const todayDate = new Date();
    const bookingDate = new Date(chosenParkingRecord.parkingdate);

    // Check if the booking date is the same as today's date
    if (bookingDate.toDateString() !== todayDate.toDateString()) {
      // Show an alert message if the check-in is not allowed on the same day
      this.component.alertMessage('Warning', 'Only allowed to check-in on the same day as the booking day', 'danger');
      return; // Return early and do not proceed with the modal creation
    }

    const modal = await this.modalController.create({
      component: CheckinOTPModalPage,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        parkingRecord: chosenParkingRecord,
      },
      cssClass: 'custom-modal',
    });

    return await modal.present();
  }

  async cancelParking(chosenParking: any) {

    if (chosenParking.parkingstatus === 'BOOKED') {

      const alert = await this.alertController.create({
        header: 'Confirmation',
        message: 'Are you sure you want to cancel this booking?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              // No action needed
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.presentLoading();
              this.bookps.deleteParkingBooking(chosenParking.APQParkingID).subscribe(
                (response: any) => {
                  console.log('Delete Response', response);
                  this.dismissLoading();
                  this.component.toastMessage('Successfully deleted booking for parking' + chosenParking.parkinglocation + '- ' + chosenParking.parkingspotid, 'success').then(() => {
                    this.clearSelectedField();
                    this.doRefresh();
                  });
                },
                (error: any) => {
                  this.dismissLoading();
                  console.log(error);
                }
              );

            }
          }
        ]
      });
      await alert.present();
    }

  }

  clearSelectedField() {
    for (const prop in this.chosenParkingRecord) {
      if (this.chosenParkingRecord.hasOwnProperty(prop)) {
        this.chosenParkingRecord[prop] = '---'; // or chosenFields[prop] = null;
      }
    }
  }

}

