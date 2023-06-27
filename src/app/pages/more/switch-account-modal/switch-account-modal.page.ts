import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ComponentService } from 'src/app/services';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-switch-account-modal',
  templateUrl: './switch-account-modal.page.html',
  styleUrls: ['./switch-account-modal.page.scss'],
})
export class SwitchAccountModalPage implements OnInit {

  @Input() userData: any[];

  constructor(private modalCtrl: ModalController,
    private component: ComponentService,
    private storage: Storage
  ) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  selectUser(user: any) {
    // Handle user selection here
    console.log('Selected User:', user);
    this.component.toastMessage(`Switched to ${user.displayname} -  ${user.username}`, 'success');
    console.log(`checking storage to ${user.role} - ${user.userid}- ${user.contactno}`);
    const cachedUserData = {
      parkinguserid: user.userid,
      parkingRole: user.role,
      parkingusercontact: user.contactno,
    };

    this.storage.set('userData', cachedUserData);
    this.modalCtrl.dismiss(user, 'selected');
  }

}
