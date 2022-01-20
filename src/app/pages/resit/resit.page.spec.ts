import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResitPage } from './resit.page';

describe('ResitPage', () => {
  let component: ResitPage;
  let fixture: ComponentFixture<ResitPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResitPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
