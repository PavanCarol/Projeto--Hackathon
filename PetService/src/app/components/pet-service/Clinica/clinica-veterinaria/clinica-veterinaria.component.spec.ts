import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicaVeterinariaComponent } from './clinica-veterinaria.component';

describe('ClinicaVeterinariaComponent', () => {
  let component: ClinicaVeterinariaComponent;
  let fixture: ComponentFixture<ClinicaVeterinariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicaVeterinariaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClinicaVeterinariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
