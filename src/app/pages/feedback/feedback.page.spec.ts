import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackPage } from './feedback.page';
import { FeedbackService, SettingsService, VersionService } from '../../services';

describe('FeedbackPage', () => {
  let component: FeedbackPage;
  let fixture: ComponentFixture<FeedbackPage>;
  let getSpy: jasmine.Spy;
  let platformSpy: jasmine.Spy;

  beforeEach(async(() => {
    const feedbackService = jasmine.createSpyObj('FeedbackService', ['platform']);
    platformSpy = feedbackService.platform.and.returnValue('Mozilla');

    const settingsService = jasmine.createSpyObj('SettingsService', ['get']);
    getSpy = settingsService.get.and.returnValue(null);

    TestBed.configureTestingModule({
      declarations: [ FeedbackPage ],
      providers: [
        { provide: FeedbackService, useValue: feedbackService },
        { provide: SettingsService, useValue: settingsService },
        VersionService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve mobile number', () => {
    expect(getSpy).toHaveBeenCalledWith('contactNo');
  });
});