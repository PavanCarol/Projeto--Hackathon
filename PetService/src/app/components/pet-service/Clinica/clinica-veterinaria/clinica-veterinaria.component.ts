import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpRequestService } from '../../../../services/http-request.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogNewVeterinarioComponent } from '../dialog-new-veterinario/dialog-new-veterinario.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-clinica-veterinaria',
  standalone: true,
  imports: [CommonModule, MatIconModule,MatButtonModule],
  templateUrl: './clinica-veterinaria.component.html',
  styleUrl: './clinica-veterinaria.component.scss',
})
export class ClinicaVeterinariaComponent implements OnInit {
  currentIndex = 0;
  clinicas: any[] = [];
  agendamentosClinica: any[] = [];

  constructor(
    public dialog: MatDialog,
    private httpService: HttpRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.httpService.getAgendamentosClinica().subscribe(
      (data) => {
        this.agendamentosClinica = data.value;
      },
      (error) => {
        console.error(
          'Erro ao buscar dados dos agendamentos da clínica',
          error
        );
      }
    );
    this.httpService.getClinicas().subscribe(
      (data) => {
        this.clinicas = data.value;
      },
      (error) => {
        console.error('Erro ao buscar dados das clínicas', error);
      }
    );
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

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialogNewVeterinarioComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  goToInformationVet(clinicaId: string) {
    console.log('Navigating to InformacaoVet with clinicaId:', clinicaId);
    if (clinicaId) {
      this.router.navigate(['/information', clinicaId]);
    } else {
      console.error('Invalid clinicaId:', clinicaId);
    }
  }

  get transformStyle() {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  nextSlide() {
    if (this.currentIndex < this.clinicas.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.clinicas.length - 1;
    }
  }

  // Método para atualizar o status do agendamento
  updateStatus(agendamentoId: string, status: number) {
    this.httpService.updateStatusAgendamento(agendamentoId, status).subscribe(
      (response) => {
        console.log('Status atualizado com sucesso:', response);
        // Atualize o status localmente após sucesso na atualização
        const agendamento = this.agendamentosClinica.find(
          (a) => a.cra6a_agendamentoclinicaid === agendamentoId
        );
        if (agendamento) {
          agendamento.cra6a_status = status;
        }
      },
      (error) => {
        console.error('Erro ao atualizar o status:', error);
      }
    );
  }
}
