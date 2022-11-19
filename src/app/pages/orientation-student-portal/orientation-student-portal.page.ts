import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { OrientationStudentsList } from 'src/app/interfaces/e-orientation';
import { WsApiService, CasTicketService, ComponentService } from 'src/app/services';
import { ViewStudentProfileModalPage } from './view-student-profile-modal/view-student-profile-modal.page';

@Component({
  selector: 'app-orientation-student-portal',
  templateUrl: './orientation-student-portal.page.html',
  styleUrls: ['./orientation-student-portal.page.scss'],
})
export class OrientationStudentPortalPage implements OnInit {

  studentsList$: Observable<OrientationStudentsList[]>;
  skeletons = new Array(5);
  devUrl = 'https://gv8ap4lfw5.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(
    private ws: WsApiService,
    private modalCtrl: ModalController,
    private cas: CasTicketService,
    private component: ComponentService
  ) { }

  ngOnInit() {
    this.studentsList$ = this.ws.get<OrientationStudentsList[]>('/orientation/student_list');
  }

  openForms() {
    // external pages does not use relative or absolute link
    const url = 'http://forms.sites.apiit.edu.my/my-inbox/';

    this.cas.getST(url).subscribe(st => {
      this.component.openLink(`${url}?ticket=${st}`);
    });
  }

  async viewProfile(studentID: string) {
    const modal = await this.modalCtrl.create({
      component: ViewStudentProfileModalPage,
      componentProps: { studentID }
    });
    await modal.present();
  }
}
