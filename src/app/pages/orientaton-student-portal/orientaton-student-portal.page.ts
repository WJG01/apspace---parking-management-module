import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { OrientationStudentsList } from 'src/app/interfaces';
import { CasTicketService, WsApiService } from 'src/app/services';
import { AddNewStudentComponent } from './add-new-student/add-new-student.component';
import { ViewStudentProfileModalPage } from './view-student-profile/view-student-profile-modal';

@Component({
  selector: 'app-orientaton-student-portal',
  templateUrl: './orientaton-student-portal.page.html',
  styleUrls: ['./orientaton-student-portal.page.scss'],
})
export class OrientatonStudentPortalPage implements OnInit {
  studentsList$: Observable<OrientationStudentsList[]>;
  skeletons = new Array(5);

  constructor(
    private ws: WsApiService,
    private modalCtrl: ModalController,
    private network: Network,
    private cas: CasTicketService,
    private iab: InAppBrowser
  ) { }

  ngOnInit() {
    // tslint:disable-next-line: max-line-length
    this.studentsList$ = this.ws.get<OrientationStudentsList[]>('/orientation/student_list');
  }

  openForms() {
    // external pages does not use relative or absolute link
    const url = 'http://forms.sites.apiit.edu.my/my-inbox/';
    if (this.network.type !== 'none') {
      this.cas.getST(url).subscribe(st => {
        this.iab.create(`${url}?ticket=${st}`, '_system', 'location=true');
      });
    }
  }

  async insertNewStudent() {
    const modal = await this.modalCtrl.create({
      component: AddNewStudentComponent,
      cssClass: 'full-page-modal'
    });

    await modal.present();
  }

  async viewProfile(studentID: string) {
    const modal = await this.modalCtrl.create({
      component: ViewStudentProfileModalPage,
      cssClass: 'custom-modal-style',
      componentProps: { studentID }
    });
    await modal.present();
    await modal.onDidDismiss();
  }
}
