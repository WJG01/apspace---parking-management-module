import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { NavController } from '@ionic/angular';

import { asyncData } from '../../../testing';
import { CasTicketService, SettingsService } from '../../services';
import { FusePipe } from '../../shared/fuse/fuse.pipe';
import { ByGroupPipe } from './by-group.pipe';
import { MorePage } from './more.page';

describe('MorePage', () => {
  let component: MorePage;
  let fixture: ComponentFixture<MorePage>;
  let navCtrlSpy: jasmine.Spy;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;

  beforeEach(async(() => {
    const navCtrl = jasmine.createSpyObj('NavController', ['navigateForward']);
    navCtrlSpy = navCtrl.navigateForward.and.returnValue(true);
    const cas = jasmine.createSpyObj('CasTicketService', ['getST']);
    cas.getST.and.returnValue(asyncData('ticket'));
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['get', 'get$']);

    TestBed.configureTestingModule({
      declarations: [MorePage, ByGroupPipe, FusePipe],
      providers: [
        { provide: CasTicketService, useValue: cas },
        { provide: InAppBrowser, useValue: {} },
        { provide: NavController, useValue: navCtrl },
        { provide: Network, useValue: {} },
        { provide: SettingsService, useValue: settingsServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should route to local url', () => {
    component.openPage('/hello');
    expect(navCtrlSpy).toHaveBeenCalledWith(['/hello']);
  });

  it('should not route to external url', () => {
    component.openPage('https://external/hello');
    expect(navCtrlSpy).not.toHaveBeenCalled();
  });
});
