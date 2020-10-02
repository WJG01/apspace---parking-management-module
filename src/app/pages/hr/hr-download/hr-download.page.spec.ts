import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HrDownloadPage } from './hr-download.page';

describe('HrDownloadPage', () => {
  let component: HrDownloadPage;
  let fixture: ComponentFixture<HrDownloadPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HrDownloadPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HrDownloadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
