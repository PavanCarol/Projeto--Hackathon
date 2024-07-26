import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetServiceComponent } from './pet-service.component';

describe('PetServiceComponent', () => {
  let component: PetServiceComponent;
  let fixture: ComponentFixture<PetServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetServiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PetServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
