import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CovidRtkFormPage } from './covid-rtk-form.page';

describe('CovidRtkFormPage', () => {
  let component: CovidRtkFormPage;
  let fixture: ComponentFixture<CovidRtkFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidRtkFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CovidRtkFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
