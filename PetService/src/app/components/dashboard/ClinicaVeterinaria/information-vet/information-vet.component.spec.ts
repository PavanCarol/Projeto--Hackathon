import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationVetComponent } from './information-vet.component';

describe('InformationVetComponent', () => {
  let component: InformationVetComponent;
  let fixture: ComponentFixture<InformationVetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationVetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InformationVetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
