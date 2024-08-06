import { Calendar } from '@fullcalendar/core';
import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CommonModule } from '@angular/common';
import { HttpRequestService } from '../../../services/http-request.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogInfoComponent } from '../../../dialog/dialog-info/dialog-info.component';

@Component({
  selector: 'app-calendario',
  standalone: false,
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss',
})
export class CalendarioComponent implements OnInit {
  constructor(
    private httpService: HttpRequestService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.httpService.getAgendamentos().subscribe(
      (data) => {
        this.initializeCalendar(data.value);
      },
      (error) => {
        console.error('Erro ao buscar agendamentos:', error);
      }
    );
  }

  initializeCalendar(agendamentos: any[]): void {
    let calendarEl: HTMLElement = document.getElementById('calendar')!;
    let calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      events: agendamentos.map((agendamento) => ({
        title: `Banho e Tosa: ${agendamento.donoPetNome}`,
        start: agendamento.cra6a_databanhotosa,
        color: this.getEventColor(agendamento.cra6a_banhooutosa),
        id: agendamento.cra6a_banhotosaid, // Adicionando o ID do agendamento para buscar informações detalhadas
      })),
      eventClick: (info) => this.openDialog(info.event.id),
    });
    calendar.render();
  }

  getEventColor(banhoOuTosa: number): string {
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

  openDialog(agendamentoId: string): void {
    this.httpService.getAgendamentoById(agendamentoId).subscribe(
      (agendamento) => {
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
