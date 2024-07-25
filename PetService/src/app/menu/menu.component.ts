import { CommonModule } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';

export type MenuItem={
  icon: string;
  label: string;
  router: string;
}
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  standalone: true,
  imports:[
    CommonModule,
    MatIconModule,
    MatListModule],
})
export class MenuComponent {

  sideNavCollapsed = signal(false);

  @Input() set collapsed(val: boolean){
    this.sideNavCollapsed.set(val);
  }
  menuItems = signal<MenuItem[]>([
    {
      icon: 'calendar_month',
      label:'Calendário',
      router:"home",
    },
    {
      icon: ' pets',
      label:'Clínica',
      router:"clinica",
    },
    {
      icon: 'chat_bubble',
      label:'Mensagem',
      router:"mensagem",
    },
    {
      icon: 'manufacturing ',
      label:'Configuração',
      router:"configuracao",
    },
  ]);

  profilePicSize = computed(() => this.sideNavCollapsed() ? '32' : '200');
}
