/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, NgZone, OnInit } from '@angular/core';
import { EmergencyDetailsModalPage } from './emergency-details-modal/emergency-details-modal.page';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import emergencyDummyData from './emergencyDetailsDummy.json';
import { EmergencyDetails } from 'src/app/interfaces/emergency-details';
import { Observable, of } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { DatePipe } from '@angular/common';
import { ParkingEmergencyService } from 'src/app/services/parking-emergency.service';
import { ComponentService } from 'src/app/services';
import { finalize } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-parking-emergency',
  templateUrl: './parking-emergency.page.html',
  styleUrls: ['./parking-emergency.page.scss'],
})
export class ParkingEmergencyPage implements OnInit {

  emergency$: Observable<EmergencyDetails[]>;
  emergencyDetails: any;
  foundEmergencyDetails: EmergencyDetails | null = null;
  sosStatus = '- - -';
  latestReportDateTimeDisplay = '- - -';
  latestStatusRead = '';
  latestEmergencyReportID = '';
  isSosCallInProgress: boolean = true;

  currentLoginUserID = '';
  currentLoginUserContact = '';
  emergencyReports: any[] = [];
  needLoading = true; // Loading flag

  private holdTimer: any;

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private storage: Storage,
    private peS: ParkingEmergencyService,
    private component: ComponentService,
    private ngZone: NgZone,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    //this.emergencyDetails = emergencyDummyData;
    this.needLoading = true;
    this.emergency$ = of(emergencyDummyData);
    this.doRefresh();
    this.getUserData();
    this.getLatestSosStatus();
    // this.createEmergency();
  }

  doRefresh(refresher?) {
    this.needLoading = true;
    this.getUserData();
    this.getLatestSosStatus();

    if (refresher) {
      refresher.target.complete();
    }
  }


  async getUserData() {
    const userData = await this.storage.get('userData');
    if (userData) {
      this.currentLoginUserID = userData.parkinguserid;
      this.currentLoginUserContact = userData.parkingusercontact;
      //console.log(this.currentLoginUserContact);
    }
  }

  getLatestSosStatus() {
    this.peS.getAllEmergencyReport().subscribe(
      (response: any) => {
        this.emergencyReports = response.selectEmergencyResponse;
        const filteredReports = this.emergencyReports.filter(report => report.userid === this.currentLoginUserID);
        console.log('current user', this.currentLoginUserID);
        console.log('filterreport', filteredReports);


        if (filteredReports.length > 0) {
          filteredReports.sort((a, b) => new Date(b.reportdatetime).getTime() - new Date(a.reportdatetime).getTime());
          const latestReport = filteredReports[0];
          console.log('Latest Report', latestReport);
          this.latestStatusRead = latestReport.emergencyreportstatus;
          this.latestEmergencyReportID = latestReport.APQEmergencyID;

          console.log('UserLoginID', this.currentLoginUserID);
          console.log('Latest emergency report status:', this.latestStatusRead);

          if (this.latestStatusRead === 'HELPFIND') {
            this.sosStatus = 'Looking For Help';
          } else if (this.latestStatusRead === 'HELPFOUND') {
            this.sosStatus = 'Help Found';
          } else if (this.latestStatusRead === 'HELPCOMPLETE') {
            this.sosStatus = 'Solved';
          }

          this.latestReportDateTimeDisplay = latestReport.reportdatetime;

          console.log('Latest emergency report status:', this.sosStatus);
        } else {
          console.log('No emergency reports found for the current login user.');
          this.latestStatusRead = '';
          this.sosStatus = '- - -';
          this.latestReportDateTimeDisplay = '- - -';
        }
      },
      (error: any) => {
        console.log(error);
        this.needLoading = false;
      }
    );
  }


  async onClick(event: MouseEvent) {
    if (this.latestStatusRead === 'HELPFIND' || this.latestStatusRead === 'HELPFOUND') {
      console.log('Hello i ran');
      this.component.toastMessage('Existing SOS call in progress !', 'danger');
    } else {
      this.holdTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.createEmergency();
        });
      }, 3000);
    }
  }

  onMouseUp(): void {
    clearTimeout(this.holdTimer);
  }

  isButtonHovered(): boolean {
    return this.latestStatusRead === 'HELPFIND' || this.latestStatusRead === 'HELPFOUND';
  }

  createEmergency(): void {
    const currentDate = new Date();
    const datePipe = new DatePipe('en-US');

    const formattedDateTime = datePipe.transform(currentDate, 'yyyy-dd-MMTHH:mm:ss');

    const body = {
      userid: this.currentLoginUserID,
      usercontactno: this.currentLoginUserContact,
      securityguardid: '',
      emergencyreportstatus: 'HELPFIND',
      reportdatetime: formattedDateTime,
      parkingspotid: this.currentLoginUserID,
    };
    const headers = { 'Content-Type': 'application/json' };

    if (body) {
      this.peS.createNewEmergencyReport(body, headers)
        .pipe(
          finalize(() => {
            this.component.toastMessage('Initiated SOS Call. Kindly wait for assistance to arrive.', 'success').then(() => {
              this.sosStatus = 'Looking For Help';
            });
          })
        )
        .subscribe({
          next: () => {
            // Success handling if needed
            this.doRefresh();

          },
          error: (err) => {
            console.log('Error:', err);
            this.component.toastMessage(err.message, 'danger');
          }
        });
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.holdTimer);
  }

  async showDetails() {
    const modal = await this.modalCtrl.create({
      component: EmergencyDetailsModalPage,
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    modal.present();
  }

  async cancel() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure you want to  your current SOS call?',
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
            this.deleteCurrentSosCall();
          }
        }
      ]
    });

    await alert.present();
  }

  deleteCurrentSosCall() {
    if (this.latestStatusRead === 'HELPFIND' || this.latestStatusRead === 'HELPFOUND') {
      console.log('delete code calling');
      this.peS.deleteEmergencyReport(this.latestEmergencyReportID).subscribe(
        (response: any) => {
          console.log('Delete Response', response);
          this.component.toastMessage('SOS call cancelled successfully', 'success').then(() => {
            this.sosStatus = '- - -';
            this.latestReportDateTimeDisplay = '- - -';
            this.doRefresh();
          });
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  loadEmergencyDetails(): void {
    const victimID = '1'; // Predefined victimID

    this.emergency$
      .subscribe((emergencyDetails: EmergencyDetails[]) => {
        const filteredData = emergencyDetails.filter(item => item.victimID === victimID);
        if (filteredData.length > 0) {
          this.foundEmergencyDetails = filteredData.reduce((acc, curr) => {
            if (!acc || curr.reportedDateTime > acc.reportedDateTime) {
              return curr;
            }
            return acc;
          });
        } else {
          //console.log('No emergency details found!');
          this.foundEmergencyDetails = null;
        }
        if (this.foundEmergencyDetails) {
          //console.log('Found emergency details: ', this.foundEmergencyDetails);
          this.openEmergencyDetailsModal(this.foundEmergencyDetails);
        }
      });
  }


  async openEmergencyDetailsModal(emergencyDetailsItem: any): Promise<void> {
    //console.log('Checking what inside data: ', emergencyDetailsItem);
    const modal = await this.modalCtrl.create({
      component: EmergencyDetailsModalPage,
      componentProps: {
        emergencyDetailsItem
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    await modal.present();
  }
}
