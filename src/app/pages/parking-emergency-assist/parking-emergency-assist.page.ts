/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { ParkingEmergencyService } from 'src/app/services/parking-emergency.service';
import { Storage } from '@ionic/storage-angular';
import { ComponentService } from 'src/app/services/component.service';
import { AlertController, LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-parking-emergency-assist',
  templateUrl: './parking-emergency-assist.page.html',
  styleUrls: ['./parking-emergency-assist.page.scss'],
})
export class ParkingEmergencyAssistPage implements OnInit {

  loading: HTMLIonLoadingElement;
  emergencyReports: any[] = [];
  currentLoginUserID = '';
  selectedSegment: 'newRequest' | 'assignedRequest' | 'completedRequest' = 'newRequest';
  needLoading = true; // Loading flag

  chosenEmergencyRecord: any = null;
  chosenEmergencyID: any;
  chosenReportedDate: any;
  chosenReportedBy: any;
  chosenParkingSpot: any;
  chosenContactNo: any;
  chosenAssignedSecurity: any;

  emergencyStatus: string;
  // Inside your component class
  newRequestIndex: number = 0;
  assignedRequestIndex: number = 0;
  completedRequestIndex: number = 0;


  constructor(
    private peS: ParkingEmergencyService,
    private storage: Storage,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.getUserData();
    this.doRefresh();
    this.getAllEmergencies();
    console.log('this emergency report', this.chosenEmergencyRecord);
  }

  doRefresh(refresher?) {
    this.needLoading = true;
    this.getAllEmergencies();

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


  getAllEmergencies() {
    this.peS.getAllEmergencyReport().subscribe(
      (response: any) => {
        this.emergencyReports = response.selectEmergencyResponse;

        //Concantenate parking IDs for all records
        this.emergencyReports.forEach((record: any) => {
          const APQEmergencyIdDisplay = record.APQEmergencyID; // Get the APQParkingID from the record
          const firstPart = '#' + APQEmergencyIdDisplay.split('-')[0]; // Extract the first part before the first hyphen "-"
          record.APQEmergencyIdDisplay = firstPart;
        });

        // sort date descending
        this.emergencyReports.sort((a, b) => {
          // Convert the reportdatetime strings to Date objects for comparison
          const dateA = new Date(a.reportdatetime);
          const dateB = new Date(b.reportdatetime);
          // Sort in descending order based on reportdatetime
          return dateB.getTime() - dateA.getTime();
        });
        this.needLoading = false; // Set loading flag to false when data is loaded
        console.log('result', this.emergencyReports);
      },
      (error: any) => {
        console.log(error);
        this.needLoading = false;
      }
    );
  }

  getDistinctiveIndex(emergencyStatus: string, index: number): number {
    let counter = 0;

    // Iterate through the emergencyReports to count the distinctive index
    for (let i = 0; i <= index; i++) {
      if (this.emergencyReports[i].emergencyreportstatus === emergencyStatus) {
        counter++;
      }
    }

    return counter;
  }

  onSegmentChange(segmentValue: string) {
    if (segmentValue === 'newRequest') {
      this.emergencyStatus = 'HELPFIND';
    } else if (segmentValue === 'assignedRequest') {
      this.emergencyStatus = 'HELPFOUND';
    } else if (segmentValue === 'completedRequest') {
      this.emergencyStatus = 'HELPDONE';
    }

    this.clearChosenEmergencyDetails();
  }

  clearChosenEmergencyDetails() {
    this.chosenEmergencyRecord = null;
    this.chosenEmergencyID = null;
    this.chosenReportedDate = null;
    this.chosenReportedBy = null;
    this.chosenParkingSpot = null;
    this.chosenContactNo = null;
    this.chosenAssignedSecurity = null;
  }

  showEmergencyDetails(report: any) {
    this.chosenEmergencyRecord = report;
    this.chosenEmergencyID = report.APQEmergencyIdDisplay;
    this.chosenReportedDate = report.reportdatetime;
    this.chosenReportedBy = report.userid;
    this.chosenParkingSpot = report.parkingspotid ? report.parkingspotid : 'None';
    this.chosenContactNo = report.usercontactno;
    this.chosenAssignedSecurity = report.securityguardid;
  }



  acceptEmergencyReports() {
    if (this.chosenEmergencyRecord != null) {

      const body = {
        emergencyreportstatus: 'HELPFOUND',
        //this.currentLoginUserID = 'SID001',
        securityguardid: this.currentLoginUserID
      };
      const headers = { 'Content-Type': 'application/json' };

      if (body) {
        this.peS.updateEmergencyReport(this.chosenEmergencyRecord.APQEmergencyID, body, headers).subscribe({
          next: () => {
            this.component.toastMessage(`Successfully Accepted Emergency Report ${this.chosenEmergencyID} !`, 'success').then(() => {
              this.dismissLoading();
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
  }

  async cancelAcceptedEmergencyReport() {
    if (this.chosenEmergencyRecord != null) {

      const body = {
        emergencyreportstatus: 'HELPFIND',
        securityguardid: ''
      };
      const headers = { 'Content-Type': 'application/json' };

      const alert = await this.alertController.create({
        header: 'Confirmation',
        message: 'Are you sure you want to cancel?',
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
                this.peS.updateEmergencyReport(this.chosenEmergencyRecord.APQEmergencyID, body, headers).subscribe({
                  next: () => {
                    this.component.toastMessage(`Successfully Canceled Assigning Emergency Report ${this.chosenEmergencyID} to you !`, 'success').then(() => {
                      this.dismissLoading();
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
          }
        ]
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

  callReporter() {
    if (this.chosenContactNo) {
      const phoneNumber = this.chosenContactNo.trim();
      window.location.href = `tel:${phoneNumber}`;
    }
  }

}
