import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CovidPcrFormPage } from './covid-pcr-form.page';

describe('CovidPcrFormPage', () => {
  let component: CovidPcrFormPage;
  let fixture: ComponentFixture<CovidPcrFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidPcrFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CovidPcrFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
