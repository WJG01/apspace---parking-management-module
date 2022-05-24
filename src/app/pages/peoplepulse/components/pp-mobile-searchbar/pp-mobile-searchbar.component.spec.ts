import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PpMobileSearchbarComponent } from './pp-mobile-searchbar.component';

describe('PpMobileSearchbarComponent', () => {
  let component: PpMobileSearchbarComponent;
  let fixture: ComponentFixture<PpMobileSearchbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PpMobileSearchbarComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PpMobileSearchbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
