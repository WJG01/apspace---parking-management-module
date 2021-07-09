import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewAttendancePage } from './view-attendance.page';

describe('ViewAttendancePage', () => {
  let component: ViewAttendancePage;
  let fixture: ComponentFixture<ViewAttendancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAttendancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewAttendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
