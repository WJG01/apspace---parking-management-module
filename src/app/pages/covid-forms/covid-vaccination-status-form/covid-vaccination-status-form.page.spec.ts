import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CovidVaccinationStatusFormPage } from './covid-vaccination-status-form.page';

describe('CovidVaccinationStatusFormPage', () => {
  let component: CovidVaccinationStatusFormPage;
  let fixture: ComponentFixture<CovidVaccinationStatusFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidVaccinationStatusFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CovidVaccinationStatusFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
