import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent {
  isDisabled = true;
  profile = {
    name: '',
    email: '',
    password: '',
  };

  toggleEdit() {
    this.isDisabled = !this.isDisabled;
  }
  saveChanges() {
    // Lógica para salvar as mudanças
    console.log('Changes saved:', this.profile);
    this.toggleEdit(); // Desabilitar novamente os inputs após salvar
  }
}
