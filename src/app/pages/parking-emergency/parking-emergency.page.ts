/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, NgZone, OnInit } from '@angular/core';
import { EmergencyDetailsModalPage } from './emergency-details-modal/emergency-details-modal.page';
import { LoadingController, ModalController } from '@ionic/angular';
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
import { BookParkingService } from 'src/app/services/parking-book.service';


@Component({
  selector: 'app-parking-emergency',
  templateUrl: './parking-emergency.page.html',
  styleUrls: ['./parking-emergency.page.scss'],
})
export class ParkingEmergencyPage implements OnInit {

  loading: HTMLIonLoadingElement;
  emergency$: Observable<EmergencyDetails[]>;
  emergencyDetails: any;
  foundEmergencyDetails: EmergencyDetails | null = null;
  sosStatus = '- - -';
  latestReportDateTimeDisplay = '- - -';
  latestStatusRead = '';
  latestEmergencyReportID = '';
  latestEmergencyReport: any;

  currentLoginUserID = '';
  currentLoginUserContact = '';
  emergencyReports: any[] = [];
  needLoading = true; // Loading flag
  bookedParkings: any;

  private holdTimer: any;


  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private storage: Storage,
    private peS: ParkingEmergencyService,
    private component: ComponentService,
    private ngZone: NgZone,
    private bookps: BookParkingService,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {
    //this.emergencyDetails = emergencyDummyData;
    this.needLoading = true;
    this.emergency$ = of(emergencyDummyData);
    this.doRefresh();
    this.getUserData();
    this.getLatestSosStatus();
    this.getParkingSpotId();
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
        // console.log('current user', this.currentLoginUserID);
        //console.log('filterreport', filteredReports);


        if (filteredReports.length > 0) {
          filteredReports.sort((a, b) => new Date(b.reportdatetime).getTime() - new Date(a.reportdatetime).getTime());
          const latestReport = filteredReports[0];
          //console.log('Latest Report', latestReport);
          this.latestStatusRead = latestReport.emergencyreportstatus;
          this.latestEmergencyReportID = latestReport.APQEmergencyID;
          this.latestEmergencyReport = latestReport;

          console.log('UserLoginID', this.currentLoginUserID);
          //console.log('Latest emergency report status:', this.latestStatusRead);

          if (this.latestStatusRead === 'HELPFIND') {
            this.sosStatus = 'Looking For Help';
          } else if (this.latestStatusRead === 'HELPFOUND') {
            this.sosStatus = 'Help Found';
          } else if (this.latestStatusRead === 'HELPCOMPLETE') {
            this.sosStatus = 'Solved';
          }

          this.latestReportDateTimeDisplay = latestReport.reportdatetime;

          //console.log('Latest emergency report status:', this.sosStatus);
        } else {
          // console.log('No emergency reports found for the current login user.');
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


  async onMouseDown(event: MouseEvent) {
    if (this.latestStatusRead === 'HELPFIND' || this.latestStatusRead === 'HELPFOUND') {
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

  async onTouchStart(event: TouchEvent) {
    event.preventDefault(); // Prevent default touch behavior, such as scrolling
    if (this.latestStatusRead === 'HELPFIND' || this.latestStatusRead === 'HELPFOUND') {
      this.component.toastMessage('Existing SOS call in progress !', 'danger');
    } else {
      this.holdTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.createEmergency();
        });
      }, 3000);
    }
  }

  onTouchEnd(): void {
    clearTimeout(this.holdTimer);
  }

  isButtonHovered(): boolean {
    return this.latestStatusRead === 'HELPFIND' || this.latestStatusRead === 'HELPFOUND';
  }

  isHoverEffectDisabled(): boolean {
    return this.isButtonHovered();
  }

  getParkingSpotId(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.bookps.getAllBookedParkings().subscribe(
        (response: any) => {
          this.bookedParkings = response.selectParkingResponse; // Store the response in the variable
          console.log('result', this.bookedParkings);

          if (Array.isArray(this.bookedParkings)) {
            const filteredParkings = this.bookedParkings.filter(
              (item: any) => item.userid === this.currentLoginUserID && item.parkingstatus === 'CHECKIN'
            );

            if (filteredParkings.length > 0) {
              const parkingSpotId = `${filteredParkings[0].parkinglocation}-${filteredParkings[0].parkingspotid}`;
              console.log('FOUND parkingspot id', parkingSpotId);
              resolve(parkingSpotId);
            } else {
              resolve('');
            }
          }
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }

  createEmergency(): void {
    const currentDate = new Date();
    const datePipe = new DatePipe('en-US');

    const formattedDateTime = datePipe.transform(currentDate, 'yyyy-MM-ddTHH:mm:ss');
    const formattedDateTimeWithoutT = formattedDateTime.replace('T', ' ');


    this.getParkingSpotId().then(
      (parkingSpotId) => {
        const body = {
          userid: this.currentLoginUserID,
          usercontactno: this.currentLoginUserContact,
          securityguardid: '',
          emergencyreportstatus: 'HELPFIND',
          reportdatetime: formattedDateTime,
          parkingspotid: parkingSpotId,
        };
        const headers = { 'Content-Type': 'application/json' };

        console.log('BODY', body);

        if (body) {
          this.presentLoading();
          this.peS.createNewEmergencyReport(body, headers)
            .pipe(
              finalize(() => {
                this.dismissLoading();
                this.component.toastMessage('Initiated SOS Call. Kindly wait for assistance to arrive.', 'success').then(() => {
                  this.sosStatus = 'Looking For Help';
                  this.latestReportDateTimeDisplay = formattedDateTimeWithoutT;
                  this.doRefresh();
                });
              })
            )
            .subscribe({
              next: () => {
                // Success handling if needed
                //this.doRefresh();

              },
              error: (err) => {
                this.dismissLoading();
                console.log('Error:', err);
                this.component.toastMessage(err.message, 'danger');
              }
            });
        }
      }
    );
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

  ngOnDestroy(): void {
    clearTimeout(this.holdTimer);
  }

  async showDetails() {
    const modal = await this.modalCtrl.create({
      component: EmergencyDetailsModalPage,
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    await modal.present();
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
    this.presentLoading();
    if (this.latestStatusRead === 'HELPFIND' || this.latestStatusRead === 'HELPFOUND') {
      this.peS.deleteEmergencyReport(this.latestEmergencyReportID).subscribe(
        (response: any) => {
          console.log('Delete Response', response);
          this.component.toastMessage('SOS call cancelled successfully', 'success').then(() => {
            this.dismissLoading();
            this.sosStatus = '- - -';
            this.latestReportDateTimeDisplay = '- - -';
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

  loadEmergencyDetails(): void {
    if (this.latestEmergencyReport != null && this.latestStatusRead !== '') {
      this.openEmergencyDetailsModal(this.latestEmergencyReport);
    }
  }


  async openEmergencyDetailsModal(emergencyDetailsItem: any): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EmergencyDetailsModalPage,
      componentProps: {
        emergencyDetailsItem
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });

    modal.onDidDismiss().then(() => {
      // Reload or refresh the parent page here
      // You can call a function or perform any necessary actions
      this.doRefresh();
    });

    await modal.present();
  }
}
