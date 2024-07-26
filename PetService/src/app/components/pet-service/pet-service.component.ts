import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-pet-service',
  standalone: false,
  templateUrl: './pet-service.component.html',
  styleUrl: './pet-service.component.scss',
})
export class PetServiceComponent {
  collapsed = signal(false);

  sidenavWidth = computed(() => (this.collapsed() ? '78px' : '250px'));
}
