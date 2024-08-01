import { CommonModule } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

export type MenuItem = {
  icon: string;
  label: string;
  router: string;
};
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
  ],
})
export class MenuComponent {
  sideNavCollapsed = signal(false);
  userName = computed(() => this.authService.getUserName() || 'Usuário'); // Obtém o nome do usuário

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  menuItems = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Visão Geral',
      router: 'home',
    },
    {
      icon: 'calendar_month',
      label: 'Calendário',
      router: 'calendar',
    },
    {
      icon: 'pets',
      label: 'Clínica',
      router: 'clinic',
    },
    {
      icon: 'chat_bubble',
      label: 'Mensagem',
      router: 'mensagem',
    },
    {
      icon: 'person',
      label: 'Perfil',
      router: 'perfil',
    },
  ]);

  profilePicSize = computed(() => (this.sideNavCollapsed() ? '60' : '200'));

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();  // Faz o logout e redireciona para a página de login
  }
}
