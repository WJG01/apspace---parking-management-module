import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AplcProgressionPage } from './aplc-progression.page';

describe('AplcProgressionPage', () => {
  let component: AplcProgressionPage;
  let fixture: ComponentFixture<AplcProgressionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AplcProgressionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AplcProgressionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
