import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GraduateVerificationServicePage } from './graduate-verification-service.page';

describe('GraduateVerificationServicePage', () => {
  let component: GraduateVerificationServicePage;
  let fixture: ComponentFixture<GraduateVerificationServicePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GraduateVerificationServicePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GraduateVerificationServicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
