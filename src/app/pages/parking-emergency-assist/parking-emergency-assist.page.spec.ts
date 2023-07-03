import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ParkingEmergencyAssistPage } from './parking-emergency-assist.page';

describe('ParkingEmergencyAssistPage', () => {
  let component: ParkingEmergencyAssistPage;
  let fixture: ComponentFixture<ParkingEmergencyAssistPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ParkingEmergencyAssistPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingEmergencyAssistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
