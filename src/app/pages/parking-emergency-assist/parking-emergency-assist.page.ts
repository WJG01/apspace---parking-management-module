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

  chosenEmergencyRecord: any;
  chosenEmergencyID: any;
  chosenReportedDate: any;
  chosenReportedBy: any;
  chosenParkingSpot: any;
  chosenContactNo: any;
  chosenAssignedSecurity: any;

  emergencyStatus: string;


  constructor(
    private peS: ParkingEmergencyService,
    private storage: Storage,
    private component: ComponentService,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.doRefresh();
    this.getUserData();
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
    if (userData) {
      this.currentLoginUserID = userData.parkinguserid;
    }
  }


  getAllEmergencies() {
    this.peS.getAllEmergencyReport().subscribe(
      (response: any) => {
        this.emergencyReports = response.selectEmergencyResponse;

        // Convert the reportdatetime values to the desired format using moment.js
        //   this.emergencyReports.forEach(report => {
        //     report.reportdatetime = moment(report.reportdatetime).format('MMM D, YYYY');
        //   });

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

  getVisibleItemsCount(index: number): number {
    let count = 0;
    for (let i = 0; i <= index; i++) {
      if (this.emergencyReports[i].emergencyreportstatus === this.emergencyStatus) {
        count++;
      }
    }
    return count;
  }

  onSegmentChange(segmentValue: string) {
    if (segmentValue === 'newRequest') {
      this.emergencyStatus = 'HELPFIND';
    } else if (segmentValue === 'assignedRequest') {
      this.emergencyStatus = 'HELPFOUND';
    } else if (segmentValue === 'completedRequest') {
      this.emergencyStatus = 'HELPDONE';
    }
  }

  showEmergencyDetails(report: any) {
    this.chosenEmergencyRecord = report;
    this.chosenEmergencyID = report.APQEmergencyID;
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
        this.peS.updateEmergencyReport(this.chosenEmergencyID, body, headers).subscribe({
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
                this.peS.updateEmergencyReport(this.chosenEmergencyID, body, headers).subscribe({
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

}
