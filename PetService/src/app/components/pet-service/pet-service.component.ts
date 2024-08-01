import { Component, computed, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pet-service',
  standalone: false,
  templateUrl: './pet-service.component.html',
  styleUrl: './pet-service.component.scss',
})
export class PetServiceComponent {
  userName: string | null = '';

  constructor(private authService: AuthService) {
    this.userName = this.authService.getUserName(); // Obtém o nome do usuário do serviço de autenticação
  }
  collapsed = signal(false);

  sidenavWidth = computed(() => (this.collapsed() ? '78px' : '250px'));
}
