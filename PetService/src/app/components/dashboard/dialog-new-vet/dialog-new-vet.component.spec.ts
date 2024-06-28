import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewVetComponent } from './dialog-new-vet.component';

describe('DialogNewVetComponent', () => {
  let component: DialogNewVetComponent;
  let fixture: ComponentFixture<DialogNewVetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogNewVetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogNewVetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
