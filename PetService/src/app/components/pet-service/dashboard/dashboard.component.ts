import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';
import { HttpRequestService } from '../../../services/http-request.service';
Chart.register(...registerables);
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  totalAgendamentosDia: number = 0;
  totalBanhosDia: number = 0;
  totalFaturamentoMes: number = 0;
  faturamentoMensal: number[] = []; 
  meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  myChart: Chart | undefined; // Referência ao gráfico

  constructor(private httpRequestService: HttpRequestService) {}

  ngOnInit() {
    this.getTotalAgendamentosDia();
    this.getTotalBanhosDia();
    this.createChart();
    this.getTotalFaturamentoMes();
    this.getFaturamentoMensal();
    if (this.myChart) {
      this.myChart.destroy();
    }
  }

  getTotalAgendamentosDia() {
    this.httpRequestService.getTotalAgendamentosDia().subscribe(
      (response) => {
        this.totalAgendamentosDia = response.totalAgendamentos;
      },
      (error) => {
        console.error('Erro ao buscar total de agendamentos do dia:', error);
      }
    );
  }
  getTotalBanhosDia(): void {
    this.httpRequestService.getTotalBanhosDia().subscribe(
      (response: any) => {
        this.totalBanhosDia = response.totalBanhos; // Corrigido para acessar a propriedade 'total'
      },
      (error) => {
        console.error('Erro ao buscar total de banhos do dia:', error);
      }
    );
}

getTotalFaturamentoMes(): void {
  this.httpRequestService.getTotalFaturamentoMes().subscribe(
    (response) => {
      this.totalFaturamentoMes = response.totalFaturamento; // Recebe o valor do faturamento
    },
    (error) => {
      console.error('Erro ao buscar total de faturamento do mês:', error);
    }
  );
}

getFaturamentoMensal(): void {
  this.httpRequestService.getFaturamentoMensal().subscribe(
    (response) => {
      this.faturamentoMensal = response.faturamentoMensal; // Atualiza os dados de faturamento mensal
      this.createChart(); // Cria o gráfico após carregar os dados
    },
    (error) => {
      console.error('Erro ao buscar faturamento mensal:', error);
    }
  );
}
  // Método para criar o gráfico
  createChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    // Destrua o gráfico existente antes de criar um novo
    if (this.myChart) {
      this.myChart.destroy();
    }

    this.myChart = new Chart(ctx, {
      type: 'bar', // Tipo de gráfico
      data: {
        labels: this.meses, // Usando os nomes dos meses como rótulos
        datasets: [
          {
            label: 'Faturamento Mensal',
            data: this.faturamentoMensal, // Usando os dados do faturamento mensal
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}