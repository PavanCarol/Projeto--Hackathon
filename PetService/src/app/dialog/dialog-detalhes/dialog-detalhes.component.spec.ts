import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetalhesComponent } from './dialog-detalhes.component';

describe('DialogDetalhesComponent', () => {
  let component: DialogDetalhesComponent;
  let fixture: ComponentFixture<DialogDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDetalhesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
