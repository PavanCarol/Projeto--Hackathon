import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpRequestService } from '../../../../services/http-request.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ConfirmacaoAntesveterinarioComponent } from '../../../../dialog/confirmacao-antesveterinario/confirmacao-antesveterinario.component';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-informacao-veterinario',
  standalone: true,
  imports: [CommonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    FormsModule,
  
  ],
  templateUrl: './informacao-veterinario.component.html',
  styleUrl: './informacao-veterinario.component.scss',
  providers: [DatePipe],
})
export class InformacaoVeterinarioComponent implements OnInit {
  clinica: any;
  agendamentos: any[] = [];
  isEditVisible: boolean = false;
  isAnimating: boolean = false;
  selectedVeterinario: any | null = null;
  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private httpService: HttpRequestService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}


  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.httpService.getClinicaById(id).subscribe(
          (data) => {
            this.clinica = data;
            this.clinica.cra6a_datanascimento = this.datePipe.transform(
              this.clinica.cra6a_datanascimento,
              'yyyy-MM-dd'
            );
            this.loadAgendamentos(this.clinica.cra6a_clinicaid); // Certifique-se de que a chave está correta
          },
          (error) => {
            console.error('Erro ao buscar dados da clínica', error);
          }
        );
      }
    });
  }

  loadAgendamentos(veterinarioId: string): void {
    this.httpService.getAgendamentosByVeterinario(veterinarioId).subscribe(
      (data) => {
        this.agendamentos = data.value;
      },
      (error) => {
        console.error('Erro ao buscar agendamentos', error);
      }
    );
  }

  getStatusNome(valor: number): { nome: string; classe: string } {
    const statusNomes: { [key: number]: { nome: string; classe: string } } = {
      0: { nome: 'Confirmado', classe: 'status-confirmado' },
      1: { nome: 'Concluído', classe: 'status-concluido' },
      2: { nome: 'Cancelado', classe: 'status-cancelado' },
    };
    return statusNomes[valor] || { nome: 'Desconhecido', classe: 'status-desconhecido' };
  }

  formatarData(dataHora: string): string {
    const data = new Date(dataHora);
    return data.toLocaleDateString('pt-BR');
  }

  formatarHora(dataHora: string): string {
    const data = new Date(dataHora);
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

showEdit(clinica: any): void {
  this.selectedVeterinario = clinica;
  this.isEditVisible = true;
  this.isAnimating = true;
  document.querySelector('.edit')?.classList.add('show');
}


hideEdit(): void {
  this.isAnimating = false;

  setTimeout(() => {
    this.isEditVisible = false;
    this.selectedVeterinario = null;
    document.querySelector('.edit')?.classList.remove('show');
 }, 500); 
}
onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Verifica o tamanho do arquivo (exemplo: 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('O arquivo é muito grande. O tamanho máximo permitido é 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result as string;
      console.log('Base64 da imagem:', base64Image); // Log para verificar o conteúdo da imagem

      if (this.selectedVeterinario) {
        // Atualiza o campo cra6a_imagemveterinario do selectedVeterinario com o novo base64
        this.selectedVeterinario.cra6a_imagemveterinario = base64Image.split(',')[1];
      }
    };
    reader.onerror = (error) => {
      console.error('Erro ao ler o arquivo:', error);
    };
    reader.readAsDataURL(file);
  } else {
    console.error('Nenhum arquivo foi selecionado.');
  }
}

salvarAlteracao(veterinario: any): void {
  this.httpService.updateVeterinario(this.selectedVeterinario).subscribe(
    (response) => {
      console.log('Veterinário atualizado com sucesso', response);
      this.snackBar.open('Alteração concluída com sucesso.', 'Fechar', {
        duration: 2000,
      });
      this.hideEdit(); // Fecha o editor após salvar
    },
    (error) => {
      console.error('Erro ao atualizar o veterinário', error);
    }
  );
}


excluirVeterinario(veterinario: any): void {
  if (!veterinario || !veterinario.cra6a_clinicaid) return;

  const dialogRef = this.dialog.open(ConfirmacaoAntesveterinarioComponent);

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.httpService.deleteClinica(veterinario.cra6a_clinicaid).subscribe( // Aqui você deve passar o ID
        (response) => {
          console.log('Veterinário excluído com sucesso', response);
          this.hideEdit();
          this.router.navigate(['/clinic']);
        },
        (error) => {
          console.error('Erro ao excluir o veterinário', error);
        }
      );
    }
  });
}

  
}
