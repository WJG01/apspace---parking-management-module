import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MoodleEventsModal } from './moodle-events.Modal';

describe('MoodleEventsModal', () => {
  let component: MoodleEventsModal;
  let fixture: ComponentFixture<MoodleEventsModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoodleEventsModal ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MoodleEventsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
