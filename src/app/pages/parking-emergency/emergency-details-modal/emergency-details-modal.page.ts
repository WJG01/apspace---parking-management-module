import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { EmergencyDetails } from 'src/app/interfaces/emergency-details';
import { SecurityGuardDetails } from 'src/app/interfaces/securityGuard-details';
import securityGuardsDummyData from '../securityGuardsDummy.json';

@Component({
  selector: 'app-emergency-details-modal',
  templateUrl: './emergency-details-modal.page.html',
  styleUrls: ['./emergency-details-modal.page.scss'],
})
export class EmergencyDetailsModalPage implements OnInit {

  @Input() emergencyDetailsItem: EmergencyDetails;

  securityGuard$: Observable<SecurityGuardDetails[]>;
  foundSecurityGuard: any;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    //console.log('Emergency Item in modal:', this.emergencyDetailsItem);
    this.securityGuard$ = of(securityGuardsDummyData);

    this.securityGuard$.subscribe((securityGuard) => {
      const filteredData = securityGuard.filter(item => item.securityID === this.emergencyDetailsItem.securityID);
      this.foundSecurityGuard = filteredData[0];
      console.log('FOund Security guard: ',this.foundSecurityGuard);
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
