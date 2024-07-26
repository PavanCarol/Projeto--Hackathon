import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewVeterinarioComponent } from './dialog-new-veterinario.component';

describe('DialogNewVeterinarioComponent', () => {
  let component: DialogNewVeterinarioComponent;
  let fixture: ComponentFixture<DialogNewVeterinarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogNewVeterinarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogNewVeterinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
