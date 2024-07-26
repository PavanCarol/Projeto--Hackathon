import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacaoVeterinarioComponent } from './informacao-veterinario.component';

describe('InformacaoVeterinarioComponent', () => {
  let component: InformacaoVeterinarioComponent;
  let fixture: ComponentFixture<InformacaoVeterinarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacaoVeterinarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InformacaoVeterinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
