import { Calendar } from '@fullcalendar/core';
import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CommonModule } from '@angular/common';
import { HttpRequestService } from '../../../services/http-request.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogInfoComponent } from '../../../dialog/dialog-info/dialog-info.component';
import { Router } from '@angular/router';
interface Agendamento {
  type: 'banhoTosa' | 'clinica';
  cra6a_databanhotosa?: string;
  cra6a_horariodaconsulta?: string;
  donoPetNome?: string;
  cra6a_banhooutosa?: number;
  cra6a_banhotosaid?: string;
  cra6a_agendamentoclinicaid?: string;
  nomePet?: string;
  nomeVeterinario?: string;
  _cra6a_veterinario_value?: string; // Adicionado o valor do veterinário
}

@Component({
  selector: 'app-calendario',
  standalone: false,
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss',
})
export class CalendarioComponent implements OnInit {
  constructor(
    private httpService: HttpRequestService,
    private dialog: MatDialog,
    private router: Router // Adicionado o roteador
  ) {}

  ngOnInit(): void {
    this.loadAgendamentos();
  }

  loadAgendamentos(): void {
    Promise.all([
      this.httpService.getBanhoTosaAgendamentos().toPromise(),
      this.httpService.getAgendamentosClinica().toPromise(),
    ])
      .then(([banhoTosaData, clinicaData]: [any, any]) => {
        const agendamentos: Agendamento[] = [
          ...banhoTosaData.value.map((agendamento: any) => ({
            ...agendamento,
            type: 'banhoTosa',
          })),
          ...clinicaData.value.map((agendamento: any) => ({
            ...agendamento,
            type: 'clinica',
          })),
        ];
        this.initializeCalendar(agendamentos);
      })
      .catch((error) => {
        console.error('Erro ao buscar agendamentos:', error);
      });
  }

  initializeCalendar(agendamentos: Agendamento[]): void {
    let calendarEl: HTMLElement = document.getElementById('calendar')!;
    let calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      events: agendamentos.map((agendamento: Agendamento) => ({
        title: this.getEventTitle(agendamento),
        start:
          agendamento.type === 'banhoTosa'
            ? agendamento.cra6a_databanhotosa
            : agendamento.cra6a_horariodaconsulta,
        color: this.getEventColor(agendamento),
        id:
          agendamento.type === 'banhoTosa'
            ? agendamento.cra6a_banhotosaid
            : agendamento.cra6a_agendamentoclinicaid,
        extendedProps: {
          type: agendamento['type'],
          veterinarioId: agendamento._cra6a_veterinario_value,
        },
      })),
      eventClick: (info) => this.handleEventClick(info),
    });
    calendar.render();
  }

  getEventColor(agendamento: Agendamento): string {
    if (agendamento['type'] === 'banhoTosa') {
      return this.getBanhoTosaColor(agendamento.cra6a_banhooutosa!);
    }
    return 'orange'; // Cor para eventos de clínica
  }

  getEventTitle(agendamento: Agendamento): string {
    if (agendamento['type'] === 'banhoTosa') {
      return `${this.getBanhoTosaTitle(agendamento.cra6a_banhooutosa!)} - ${
        agendamento.donoPetNome
      }`;
    }
    return `${agendamento.nomePet} - Dr(a). ${agendamento.nomeVeterinario}`;
  }

  getBanhoTosaColor(banhoOuTosa: number): string {
    switch (banhoOuTosa) {
      case 1:
        return 'red';
      case 2:
        return 'blue';
      case 3:
        return 'green';
      case 4:
        return 'yellow';
      case 5:
        return 'purple';
      default:
        return 'grey';
    }
  }

  getBanhoTosaTitle(banhoOuTosa: number): string {
    switch (banhoOuTosa) {
      case 1:
        return 'Banho';
      case 2:
        return 'Tosa';
      case 3:
        return 'Banho e Tosa';
      case 4:
        return 'Tosa completa';
      case 5:
        return 'Tosa higiênica';
      default:
        return '';
    }
  }

  handleEventClick(info: any): void {
    const type = info.event.extendedProps['type'];
    const veterinarioId = info.event.extendedProps['veterinarioId'];

    if (type === 'banhoTosa') {
      this.openDialog(info.event.id, type);
    } else if (type === 'clinica') {
      this.router.navigate([`/clinic`]);
    }
  }

  openDialog(agendamentoId: string, type: string): void {
    if (type === 'banhoTosa') {
      this.httpService.getAgendamentoById(agendamentoId).subscribe(
        (agendamento) => {
          console.log(agendamento); // Verifique o conteúdo do objeto
          this.httpService
            .getClienteById(agendamento['_cra6a_donopet_value'])
            .subscribe(
              (cliente) => {
                const dialogRef = this.dialog.open(DialogInfoComponent, {
                  data: {
                    ...agendamento,
                    donoPetNome: cliente.cra6a_nome_donopet,
                  },
                });
              },
              (error) => {
                console.error('Erro ao buscar informações do cliente:', error);
              }
            );
        },
        (error) => {
          console.error('Erro ao buscar detalhes do agendamento:', error);
        }
      );
    }
  }
}
