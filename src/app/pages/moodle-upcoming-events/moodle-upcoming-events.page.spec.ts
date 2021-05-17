import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MoodleUpcomingEventsPage } from './moodle-upcoming-events-modal.page';

describe('MoodleUpcomingEventsPage', () => {
  let component: MoodleUpcomingEventsPage;
  let fixture: ComponentFixture<MoodleUpcomingEventsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoodleUpcomingEventsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MoodleUpcomingEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
