import { Component, OnInit } from '@angular/core';
import { EmergencyDetailsModalPage } from './emergency-details-modal/emergency-details-modal.page';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-parking-emergency',
  templateUrl: './parking-emergency.page.html',
  styleUrls: ['./parking-emergency.page.scss'],
})
export class ParkingEmergencyPage implements OnInit {


  sosStatus = '- - -';
  private holdTimer: any;


  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
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
}
