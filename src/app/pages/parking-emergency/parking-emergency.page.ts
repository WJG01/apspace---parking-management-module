import { Component, OnInit } from '@angular/core';
import { EmergencyDetailsModalPage } from './emergency-details-modal/emergency-details-modal.page';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import emergencyDummyData from './emergencyDetailsDummy.json';
import { EmergencyDetails } from 'src/app/interfaces/emergency-details';
import { Observable, filter, of } from 'rxjs';


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
  private holdTimer: any;

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    //this.emergencyDetails = emergencyDummyData;
    this.emergency$ = of(emergencyDummyData);
  }


  onMouseDown(): void {
    this.holdTimer = setTimeout(() => {
      this.triggerAction();
    }, 3000);
  }

  onMouseUp(): void {
    clearTimeout(this.holdTimer);
  }

  triggerAction(): void {
    // Perform your desired action here
    console.log('Action triggered!');
    this.sosStatus = 'Looking For Help';
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
