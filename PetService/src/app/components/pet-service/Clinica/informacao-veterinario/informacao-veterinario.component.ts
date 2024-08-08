import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { HttpRequestService } from '../../../../services/http-request.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-informacao-veterinario',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './informacao-veterinario.component.html',
  styleUrl: './informacao-veterinario.component.scss',
  providers: [DatePipe],
})
export class InformacaoVeterinarioComponent implements OnInit {
  clinica: any;
  agendamentos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpRequestService,
    private datePipe: DatePipe
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
}
