import { CommonModule } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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
    // {
    //   icon: 'chat_bubble',
    //   label: 'Mensagem',
    //   router: 'mensagem',
    // },
    {
      icon: 'psychology',
      label: 'Configuração do Bot',
      router: 'settings',
    },
    {
      icon: 'person',
      label: 'Perfil',
      router: 'perfil',
    },
  ]);

  profilePicSize = computed(() => (this.sideNavCollapsed() ? '60' : '200'));
}
