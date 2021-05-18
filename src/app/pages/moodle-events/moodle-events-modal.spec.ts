import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MoodleEventsModalPage } from './moodle-events-modal.page';

describe('MoodleEventsModalPage', () => {
  let component: MoodleEventsModalPage;
  let fixture: ComponentFixture<MoodleEventsModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoodleEventsModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MoodleEventsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
