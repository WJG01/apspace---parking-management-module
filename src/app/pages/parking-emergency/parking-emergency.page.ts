import { Component, NgZone, OnInit } from '@angular/core';
import { EmergencyDetailsModalPage } from './emergency-details-modal/emergency-details-modal.page';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import emergencyDummyData from './emergencyDetailsDummy.json';
import { EmergencyDetails } from 'src/app/interfaces/emergency-details';
import { Observable, filter, of } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { DatePipe } from '@angular/common';
import { ParkingEmergencyService } from 'src/app/services/parking-emergency.service';
import { ComponentService } from 'src/app/services';
import { finalize } from 'rxjs/operators';


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

  currentLoginUserID = '';
  currentLoginUserContact = '';

  private holdTimer: any;

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private storage: Storage,
    private peS: ParkingEmergencyService,
    private component: ComponentService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    //this.emergencyDetails = emergencyDummyData;
    this.emergency$ = of(emergencyDummyData);
    this.getUserData();

    // this.createEmergency();
  }

  async getUserData() {
    const userData = await this.storage.get('userData');
    if (userData) {
      this.currentLoginUserID = userData.parkinguserid;
      this.currentLoginUserContact = userData.parkingusercontact;
      console.log(this.currentLoginUserContact);
    }
  }


  onClick(event: MouseEvent): void {
    this.holdTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this.createEmergency();
      });
    }, 3000);
  }

  onMouseUp(): void {
    clearTimeout(this.holdTimer);
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
            console.log('running successfully');
            console.log('checking the body', body);
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
            // Perform the cancel action here
            // Call any necessary functions or update variables
          }
        }
      ]
    });

    await alert.present();
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
