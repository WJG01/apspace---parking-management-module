import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CovidInformationFormPage } from './covid-information-form.page';

describe('CovidInformationFormPage', () => {
  let component: CovidInformationFormPage;
  let fixture: ComponentFixture<CovidInformationFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidInformationFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CovidInformationFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
