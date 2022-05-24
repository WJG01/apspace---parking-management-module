import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PpHomeNavbarComponent } from './pp-home-navbar.component';

describe('PpHomeNavbarComponent', () => {
  let component: PpHomeNavbarComponent;
  let fixture: ComponentFixture<PpHomeNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PpHomeNavbarComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PpHomeNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
