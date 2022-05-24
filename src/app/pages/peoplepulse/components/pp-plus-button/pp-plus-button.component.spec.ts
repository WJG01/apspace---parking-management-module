import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PpPlusButtonComponent } from './pp-plus-button.component';

describe('PpPlusButtonComponent', () => {
  let component: PpPlusButtonComponent;
  let fixture: ComponentFixture<PpPlusButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PpPlusButtonComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PpPlusButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
