/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { BookParkingService } from 'src/app/services/parking-book.service';

@Component({
  selector: 'app-parking-history',
  templateUrl: './parking-history.page.html',
  styleUrls: ['./parking-history.page.scss'],
})
export class ParkingHistoryPage implements OnInit {

  selectedSegment: 'present_future' | 'past' = 'present_future';
  parkingRecords: any[] = [];


  constructor(
    private bookps: BookParkingService,

  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(refresher?) {
    // this.needLoading = true;
    this.getAllBookings();

    if (refresher) {
      refresher.target.complete();
    }
  }

  getAllBookings() {
    this.bookps.getAllBookedParkings().subscribe(
      (response: any) => {
        this.parkingRecords = response.selectParkingResponse;

        // Sort the parkingRecords array
        this.parkingRecords.sort((a, b) => {
          if (a.parkingstatus === 'CHECKIN' && b.parkingstatus !== 'CHECKIN') {
            return -1; // a comes before b
          } else if (a.parkingstatus !== 'CHECKIN' && b.parkingstatus === 'CHECKIN') {
            return 1; // a comes after b
          }

          if (a.parkingstatus === 'CHECKIN' && b.parkingstatus === 'CHECKIN') {
            // Sort by bookingcreateddate in descending order for 'CHECKIN' status
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }

          // Sort by bookingcreateddate in descending order for other statuses
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

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
    console.log('this is the parking status', parkingStatus);

    if (parkingStatus === 'present_future') {
      statusCheck = ['CHECKIN', 'BOOKED'];
    } else if (parkingStatus === 'past') {
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



}
