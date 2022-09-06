import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CovidFormsPage } from './covid-forms.page';

describe('CovidFormsPage', () => {
  let component: CovidFormsPage;
  let fixture: ComponentFixture<CovidFormsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CovidFormsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CovidFormsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
