import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PeoplepulsePage } from './peoplepulse.page';

describe('PeoplepulsePage', () => {
  let component: PeoplepulsePage;
  let fixture: ComponentFixture<PeoplepulsePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PeoplepulsePage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PeoplepulsePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
