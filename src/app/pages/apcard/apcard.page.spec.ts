import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { WsApiService } from 'src/app/services';
import { ApcardPage } from './apcard.page';

describe('ApcardPage', () => {
  let component: ApcardPage;
  let fixture: ComponentFixture<ApcardPage>;

  beforeEach(async(() => {
    const ws = jasmine.createSpyObj('WsApiService', []);

    TestBed.configureTestingModule({
      declarations: [ApcardPage],
      providers: [
        { provide: WsApiService, useValue: ws }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApcardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
