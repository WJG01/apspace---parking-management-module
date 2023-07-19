/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ComponentService } from 'src/app/services/component.service';
import { BookParkingService } from 'src/app/services/parking-book.service';
import { Storage } from '@ionic/storage-angular';
import { CheckinOTPModalPage } from './checkin-otpmodal/checkin-otpmodal.page';
import { Router } from '@angular/router';


@Component({
  selector: 'app-parking-history',
  templateUrl: './parking-history.page.html',
  styleUrls: ['./parking-history.page.scss'],
})
export class ParkingHistoryPage implements OnInit {

  selectedSegment: 'ongoingBooking' | 'completedBooking' = 'ongoingBooking';
  parkingRecords: any[] = [];
  currentLoginUserID = '';


  chosenParkingRecord = {
    APQParkingID: '---',
    parkingdate: '---',
    starttime: '---',
    endtime: '---',
    parkinglocation: '---',
    parkingspotid: '---',
    parkingstatus: '---',
    bookingcreateddatetime: '---',
  };


  constructor(
    private bookps: BookParkingService,
    private component: ComponentService,
    private storage: Storage,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController,
    private router: Router


  ) { }

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

  getAllBookings() {
    this.bookps.getAllBookedParkings().subscribe(
      (response: any) => {
        this.parkingRecords = response.selectParkingResponse;
        console.log('All Parking Records', this.parkingRecords);

        const todayDate = new Date();
        // Separate records based on status
        const checkinRecord = this.parkingRecords.find(record => record.parkingstatus === 'CHECKIN');
        const booked_completedRecords = this.parkingRecords.filter(record => record.parkingstatus === 'BOOKED' || record.parkingstatus === 'COMPLETED');

        // Create a new property combining parking date and start time as a Date object
        booked_completedRecords.forEach(record => {
          record.parkingDateTime = new Date(`${record.parkingdate} ${record.starttime}`);

          // Update status to 'COMPLETED' for records with a parking date that has passed today's date
          if (record.parkingstatus !== 'COMPLETED' && record.parkingDateTime < todayDate && record.parkingDateTime.toDateString() !== todayDate.toDateString()) {
            record.parkingstatus = 'COMPLETED';
            this.markBookingCompleted(record);
          }
        });



        // Sort the booked_completedRecords array based on parkingDateTime in ascending order
        booked_completedRecords.sort((a, b) => {
          return a.parkingDateTime.getTime() - b.parkingDateTime.getTime();
        });

        // Check if checkinRecord exists and concatenate it with the sorted booked_completedRecords
        if (checkinRecord) {
          this.parkingRecords = [checkinRecord, ...booked_completedRecords];
        } else {
          this.parkingRecords = booked_completedRecords;
        }

        console.log('result', this.parkingRecords);
      },
      (error: any) => {
        console.log(error);
      }
    );
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
    this.chosenParkingRecord = parkings;
  }

  async checkoutParking(chosenParking: any) {
    if (chosenParking.parkingstatus === 'CHECKIN') {

      const body = {
        parkingstatus: 'COMPLETED'
      };
      const headers = { 'Content-Type': 'application/json' };

      const alert = await this.alertController.create({
        header: 'Confirmation',
        message: 'Are you sure you want to checkout? <br>You have to leave this parking within 5 mins after checkout',
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
                this.bookps.updateParkingBooking(chosenParking.APQParkingID, body, headers).subscribe(
                  (response: any) => {
                    console.log('Delete Response', response);
                    this.component.toastMessage('Successfully checkout for parking' + chosenParking.location + '- ' + chosenParking.parkingspotid, 'success').then(() => {
                      this.clearSelectedField();
                      this.doRefresh();
                    });
                  },
                  (error: any) => {
                    console.log(error);
                  }

                );

              }

            }
          }
        ]
      });

      await alert.present();
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
            console.log('Found and Marked Completed for expired', parkingRecord.APQParkingID, ' parking record');
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
    const modal = await this.modalController.create({
      component: CheckinOTPModalPage,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        otp: chosenParkingRecord.checkincode,
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
              this.bookps.deleteParkingBooking(chosenParking.APQParkingID).subscribe(
                (response: any) => {
                  console.log('Delete Response', response);
                  this.component.toastMessage('Successfully deleted booking for parking' + chosenParking.location + '- ' + chosenParking.parkingspotid, 'success').then(() => {
                    this.clearSelectedField();
                    this.doRefresh();
                  });
                },
                (error: any) => {
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

