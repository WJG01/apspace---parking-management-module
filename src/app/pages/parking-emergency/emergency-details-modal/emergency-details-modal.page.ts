/* eslint-disable max-len */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { SecurityGuardDetails } from 'src/app/interfaces/securityGuard-details';
import securityGuardsDummyData from '../securityGuardsDummy.json';
import { ParkingEmergencyService } from 'src/app/services/parking-emergency.service';
import { ComponentService } from 'src/app/services/component.service';

@Component({
  selector: 'app-emergency-details-modal',
  templateUrl: './emergency-details-modal.page.html',
  styleUrls: ['./emergency-details-modal.page.scss'],
})
export class EmergencyDetailsModalPage implements OnInit {

  @Input() emergencyDetailsItem: any;

  securityGuard$: Observable<SecurityGuardDetails[]>;
  foundSecurityGuard: any;
  sosStatusHeaderDisplay: any;

  constructor(
    private modalCtrl: ModalController,
    private peS: ParkingEmergencyService,
    private component: ComponentService,
  ) { }

  ngOnInit() {
    this.loadEmergencyDetails();
  }

  loadEmergencyDetails() {
    console.log('Emergency Item in modal:', this.emergencyDetailsItem);
    this.securityGuard$ = of(securityGuardsDummyData);

    this.securityGuard$.subscribe((securityGuard) => {
      const filteredData = securityGuard.filter(item => item.securityID === this.emergencyDetailsItem.securityguardid);
      this.foundSecurityGuard = filteredData[0];
      console.log('FOund Security guard: ', this.foundSecurityGuard);
      this.loadHeaderSosStatus();
    });
  }

  loadHeaderSosStatus() {
    console.log('what is the emergency report staus', this.emergencyDetailsItem.emergencyreportstatus);

    if (this.emergencyDetailsItem.emergencyreportstatus === 'HELPFIND') {
      this.sosStatusHeaderDisplay = 'Looking for Help';

    } else if (this.emergencyDetailsItem.emergencyreportstatus === 'HELPFOUND') {
      console.log('Hello', this.emergencyDetailsItem.status);
      this.sosStatusHeaderDisplay = 'Help Found';

    } else if (this.emergencyDetailsItem.emergencyreportstatus === 'HELPCOMPLETE') {
      this.sosStatusHeaderDisplay = 'Help Completed';
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  markAsComplete() {
    if (this.emergencyDetailsItem.emergencyreportstatus === 'HELPFOUND') {

      const body = {
        emergencyreportstatus: 'HELPCOMPLETE',
      };
      const headers = { 'Content-Type': 'application/json' };

      if (body) {
        this.peS.updateEmergencyReport(this.emergencyDetailsItem.APQEmergencyID, body, headers).subscribe({
          next: () => {
            this.component.toastMessage(`Successfully Marked ${this.emergencyDetailsItem.APQEmergencyID} as Complete !`, 'success').then(() => {
              this.dismiss();
            });
          },
          error: (err) => {
            this.component.toastMessage(err.message, 'danger');
            this.dismiss();
          },
        });
      }
    }
  }


  callSecurityGuard() {
    if (this.foundSecurityGuard.contactNumber) {
      const phoneNumber = this.foundSecurityGuard.contactNumber.trim();
      window.location.href = `tel:${phoneNumber}`;
    }
  }

}
