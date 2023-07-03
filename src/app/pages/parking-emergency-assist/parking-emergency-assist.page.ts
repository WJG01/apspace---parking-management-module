import { Component, OnInit } from '@angular/core';
import { ParkingEmergencyService } from 'src/app/services/parking-emergency.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-parking-emergency-assist',
  templateUrl: './parking-emergency-assist.page.html',
  styleUrls: ['./parking-emergency-assist.page.scss'],
})
export class ParkingEmergencyAssistPage implements OnInit {

  emergencyReports: any;
  currentLoginUserID = '';
  selectedSegment: 'newRequest' | 'assignedRequest' | 'completedRequest' = 'newRequest';
  loading = true; // Loading flag


  constructor(
    private peS: ParkingEmergencyService,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.doRefresh();
    this.getUserData();
  }

  doRefresh(refresher?) {
    this.loading = true;
    this.getAllEmergencies();

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


  getAllEmergencies() {
    this.peS.getAllEmergencyReport().subscribe(
      (response: any) => {
        this.emergencyReports = response; // Store the response in the variable
        this.loading = false; // Set loading flag to false when data is loaded
        console.log('result', this.emergencyReports);
      },
      (error: any) => {
        console.log(error);
        this.loading = false;
      }
    );
  }

}
