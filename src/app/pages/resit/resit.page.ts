import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { RegistrationDate, ResitDate } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';
import { AddResitModalPage } from './add-resit-modal/add-resit-modal.page';
import { UpdateResitModalPage } from './update-resit-modal/update-resit-modal.page';

@Component({
  selector: 'app-resit',
  templateUrl: './resit.page.html',
  styleUrls: ['./resit.page.scss'],
})
export class ResitPage implements OnInit {

  resit$: Observable<ResitDate[]>;
  registrationDate$: Observable<RegistrationDate[]>;
  skeleton = new Array(5);

  constructor(
    private ws: WsApiService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh(ev?) {
    const devUrl = 'https://jiscdfg5sh.execute-api.ap-southeast-1.amazonaws.com/dev';

    this.registrationDate$ = this.ws.get<RegistrationDate[]>('/multisite/resit/registration_period', { url: devUrl }).pipe(
      finalize(() => {
        if (ev) {
          ev.target.complete();
        }
      })
    );

    this.resit$ = this.ws.get<ResitDate[]>('/multisite/resit/get_dates', { url: devUrl }).pipe(
      finalize(() => {
        if (ev) {
          ev.target.complete();
        }
      })
    );
  }

  async addResit() {
    const modal = await this.modalCtrl.create({
      component: AddResitModalPage
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.completed) {
      this.doRefresh();
    }
  }

  async updateResit(resit: ResitDate) {
    const modal = await this.modalCtrl.create({
      component: UpdateResitModalPage,
      componentProps: {
        resit
      }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.completed) {
      this.doRefresh();
    }
  }
}
