import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialofAdicionarEstoqueComponent } from './dialof-adicionar-estoque.component';

describe('DialofAdicionarEstoqueComponent', () => {
  let component: DialofAdicionarEstoqueComponent;
  let fixture: ComponentFixture<DialofAdicionarEstoqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialofAdicionarEstoqueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialofAdicionarEstoqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
