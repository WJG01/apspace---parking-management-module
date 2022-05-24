import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PpFilterComponent } from './pp-filter.component';

describe('PpFilterComponent', () => {
  let component: PpFilterComponent;
  let fixture: ComponentFixture<PpFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PpFilterComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PpFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
