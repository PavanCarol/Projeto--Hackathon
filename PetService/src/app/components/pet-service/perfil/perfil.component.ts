import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { jwtDecode } from "jwt-decode";
import { HttpRequestService } from '../../../services/http-request.service';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  isDisabled = true;
  profile = {
    id: '',
    name: '',
    email: '',
    password: ''
  };

  constructor(private httpRequestService: HttpRequestService) {}

  ngOnInit() {
    // Obtém o token JWT do localStorage e decodifica
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.profile.id = decodedToken.id;
      this.profile.name = decodedToken.name;
      this.profile.email = decodedToken.email;
      // Não é recomendado armazenar senhas no token JWT, então omitimos a senha aqui
    }
  }

  toggleEdit() {
    this.isDisabled = !this.isDisabled;
  }

  saveChanges() {
    this.httpRequestService.updateProfile(this.profile).subscribe(
      response => {
        console.log('Perfil atualizado com sucesso', response);
        this.toggleEdit();
      },
      error => {
        console.error('Erro ao atualizar perfil:', error);
      }
    );
  }
}