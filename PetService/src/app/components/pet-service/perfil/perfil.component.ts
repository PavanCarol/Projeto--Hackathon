import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { jwtDecode } from 'jwt-decode';
import { HttpRequestService } from '../../../services/http-request.service';
import { DialogConfirmComponent } from '../../../dialog/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';
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
    password: '',
  };

  constructor(
    private httpRequestService: HttpRequestService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('authToken');
    console.log('Token obtido do localStorage:', token);

    if (token) {
      const decodedToken: any = jwtDecode(token);
      console.log('Token decodificado:', decodedToken);
      this.profile.id = decodedToken.id;
      this.profile.name = decodedToken.name;
      this.profile.email = decodedToken.email;
    }
  }

  getProfile() {
    this.httpRequestService.getProfile(this.profile.id).subscribe(
      (response: any) => {
        console.log('Dados do perfil obtidos:', response);
        this.profile.name = response.name;
        this.profile.email = response.email;
      },
      (error) => {
        console.error('Erro ao obter perfil:', error);
      }
    );
  }

  toggleEdit() {
    this.isDisabled = !this.isDisabled;
  }

  saveChanges() {
    this.httpRequestService.updateProfile(this.profile).subscribe(
      (response) => {
        console.log('Perfil atualizado com sucesso', response);
        this.toggleEdit();
        this.openDialog();
      },
      (error) => {
        console.error('Erro ao atualizar perfil:', error);
      }
    );
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent);

    dialogRef.afterClosed().subscribe(() => {
      // Após fechar o diálogo, atualize o perfil novamente para refletir as mudanças
      this.getProfile();
    });
  }
}
