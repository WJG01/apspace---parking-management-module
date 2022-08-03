import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ComponentService, NotifierService, WsApiService } from '../../../../services';
import { LoadingController, ModalController } from '@ionic/angular';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-manage-assessment-types',
  templateUrl: './manage-assessment-types.page.html',
  styleUrls: ['./manage-assessment-types.page.scss'],
})
export class ManageAssessmentTypesPage implements OnInit {
  // devURL = 'https://swze54usn5.execute-api.ap-southeast-1.amazonaws.com/dev';
  loading: HTMLIonLoadingElement;

  assessmentType: string;
  assessmentTypes$: Observable<any>;

  constructor(
    public modalCtrl: ModalController,
    private component: ComponentService,
    public loadingCtrl: LoadingController,
    private ws: WsApiService,
    private notifierService: NotifierService
  ) { }

  ngOnInit() {
    this.doRefresh();
  }

  doRefresh() {
    this.assessmentTypes$ = this.ws.get<any>('/exam/assessment_type');
  }

  addAssessmentType(assessmentTypes) {
    let isDuplicated = false;

    assessmentTypes.forEach(assessmentType =>
      assessmentType.ASSESSMENT_TYPE.toUpperCase() === this.assessmentType.toUpperCase() ?
        isDuplicated = true : null
    );

    if (isDuplicated) {
      this.component.toastMessage('Assessment Type is existed.', 'danger');
      return;
    }

    const bodyObject = {assessment_type: this.assessmentType};
    const body = new HttpParams({ fromObject: { ...bodyObject } }).toString();
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    this.ws.post('/exam/add_assessment_type', { body, headers }).subscribe({
      next: () => {
        this.notifierService.assessmentTypeUpdated.next('SUCCESS');
      },
      error: (err) => {
        this.component.toastMessage(`${ err.status }: ${ err.error.error }`, 'danger');
      },
      complete: () => {
        this.assessmentType = '';
        this.doRefresh();
      }
    });
  }

  deleteAssessmentType(assessmentType) {
    const bodyObject = {assessment_type: assessmentType};
    const body = new HttpParams({ fromObject: { ...bodyObject } }).toString();
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    this.ws.post('/exam/delete_assessment_type', { body, headers }).subscribe({
      next: () => {
        this.notifierService.assessmentTypeUpdated.next('SUCCESS');
      },
      error: (err) => {
        this.component.toastMessage(`${ err.status }: ${ err.error.error }`, 'danger');
      },
      complete: () => {
        this.doRefresh();
      }
    });
  }

  closeModal() {
    this.modalCtrl.dismiss(null);
  }

}
