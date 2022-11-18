import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map, Observable, tap } from 'rxjs';

import { OrientationStudentDetails, BeAPUStudentDetails, StaffDirectory } from 'src/app/interfaces';
import { WsApiService } from 'src/app/services';

@Component({
  selector: 'app-view-student-profile-modal',
  templateUrl: './view-student-profile-modal.page.html',
  styleUrls: ['./view-student-profile-modal.page.scss'],
})
export class ViewStudentProfileModalPage implements OnInit {

  @Input() studentID: string;
  studentDetails$: Observable<OrientationStudentDetails>;
  studentImage$: Observable<BeAPUStudentDetails[]>;
  councelorProfile$: Observable<StaffDirectory>;
  devUrl = 'https://gv8ap4lfw5.execute-api.ap-southeast-1.amazonaws.com/dev';

  constructor(
    private modalCtrl: ModalController,
    private ws: WsApiService
  ) { }

  ngOnInit() {
    this.studentDetails$ = this.ws.get<OrientationStudentDetails>(`/orientation/student_details?id=${this.studentID}`)
      .pipe(
        tap(studentDetails => {
          if (studentDetails.student_details.length > 0) {
            this.studentImage$ = this.ws.post<BeAPUStudentDetails[]>('/student/image', {
              body: {
                id: [studentDetails.student_details[0].STUDENT_NUMBER]
              }
            });
          }
          if (studentDetails.councelor_details.length > 0) {
            this.councelorProfile$ = this.ws.get<StaffDirectory[]>('/staff/listing', { caching: 'cache-only' }).pipe(
              map(res => res.find(staff => staff.ID.toLowerCase() === studentDetails.councelor_details[0].SAMACCOUNTNAME.toLowerCase()))
            );
          }
        })
      );
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
