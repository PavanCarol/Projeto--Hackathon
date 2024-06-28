import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogForgotComponent } from './dialog-forgot.component';

describe('DialogForgotComponent', () => {
  let component: DialogForgotComponent;
  let fixture: ComponentFixture<DialogForgotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogForgotComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogForgotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
