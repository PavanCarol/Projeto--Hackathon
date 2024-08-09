import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateBanhoComponent } from './dialog-create-banho.component';

describe('DialogCreateBanhoComponent', () => {
  let component: DialogCreateBanhoComponent;
  let fixture: ComponentFixture<DialogCreateBanhoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCreateBanhoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogCreateBanhoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
