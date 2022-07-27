import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PpEditModalComponent } from './pp-edit-modal.component';

describe('PpEditModalComponent', () => {
  let component: PpEditModalComponent;
  let fixture: ComponentFixture<PpEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PpEditModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PpEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
