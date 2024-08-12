import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { jwtDecode } from 'jwt-decode';
import { HttpRequestService } from '../../../services/http-request.service';
import { DialogConfirmComponent } from '../../../dialog/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DialogCreateBanhoComponent } from '../../../dialog/dialog-create-banho/dialog-create-banho.component';
import { Router } from '@angular/router';
import { DialogDetalhesComponent } from '../../../dialog/dialog-detalhes/dialog-detalhes.component';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  isDisabled = true;
  showEditIcon = false;
  categoriasBanho: any[] = [];
  profile = {
    id: '',
    name: '',
    email: '',
    password: '',
  };

  constructor(
    private httpService: HttpRequestService, // Certifique-se de que o nome do serviço esteja correto
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchCategoriasBanho(); // Chama a função para buscar as categorias
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
    this.httpService.getProfile(this.profile.id).subscribe(
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
    this.httpService.updateProfile(this.profile).subscribe(
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

  openDialogBanho(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialogCreateBanhoComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  tipoBanhoMap = {
    1: 'Banho',
    2: 'Banho e Tosa na máquina',
    3: 'Banho e Tosa na tesoura',
    4: 'Banho e Tosa higiênica',
    5: 'Banho e Tosa completa',
  };

  porteMap = {
    1: 'Mini',
    2: 'Pegueno',
    3: 'Médio',
    4: 'Grande',
  };

  pelagemMap = {
    1: 'Médio',
    2: 'Curto',
    3: 'Longo',
  };

  fetchCategoriasBanho() {
    this.httpService.getCategoriaBanho().subscribe(
      (data) => {
        this.categoriasBanho = data.map((categoria: any) => {
          const tipoBanhoKey =
            categoria.cra6a_tipodebanho as keyof typeof this.tipoBanhoMap;
          const porteKey = categoria.cra6a_porte as keyof typeof this.porteMap;
          const pelagemKey =
            categoria.cra6a_pelagem as keyof typeof this.pelagemMap;

          return {
            cra6a_custoid: categoria.cra6a_custoid, // Adiciona o ID ao retorno
            cra6a_tipodebanho: this.tipoBanhoMap[tipoBanhoKey],
            cra6a_porte: this.porteMap[porteKey],
            cra6a_pelagem: this.pelagemMap[pelagemKey],
            cra6a_valor: categoria.cra6a_valor,
          };
        });
      },
      (error) => {
        console.error('Erro ao buscar categorias de banho:', error);
      }
    );
  }

  openDialogTable(categoria: any): void {
    const dialogRef = this.dialog.open(DialogDetalhesComponent, {
      data: { categoria }, // Passa os dados da categoria selecionada para o diálogo
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Categoria editada:', result);
        // Lógica para atualizar a categoria no frontend, caso necessário
      }
    });
  }
}
