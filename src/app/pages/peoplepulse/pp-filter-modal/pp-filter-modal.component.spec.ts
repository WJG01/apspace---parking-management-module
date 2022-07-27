import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PpFilterModalComponent } from './pp-filter.component';

describe('PpFilterModalComponent', () => {
  let component: PpFilterComponent;
  let fixture: ComponentFixture<PpFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PpFilterModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PpFilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
