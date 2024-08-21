import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';
import { HttpRequestService } from '../../../services/http-request.service';
import { CommonModule } from '@angular/common';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
Chart.register(...registerables);
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  totalAgendamentosDia: number = 0;
  totalBanhosDia: number = 0;
  totalFaturamentoMes: number = 0;
  faturamentoMensal: number[] = [];
  agendamentosBanhoMes: number[] = [];
  agendamentosClinicaMes: number[] = [];
  estoqueItens: any[] = []; 
  meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  myChart: Chart | undefined; // Referência ao gráfico de faturamento
  comparacaoChart: Chart | undefined; // Referência ao gráfico de comparação de agendamentos

  constructor(private httpRequestService: HttpRequestService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.getTotalAgendamentosDia();
    this.getTotalBanhosDia();
    this.getTotalFaturamentoMes();
    this.getFaturamentoMensal();
    this.getAgendamentosBanhoClinicaMes();
    this.loadEstoqueItens();
  }

  ngOnDestroy() {
    if (this.myChart) {
      this.myChart.destroy();
    }
    if (this.comparacaoChart) {
      this.comparacaoChart.destroy();
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

venderItem(item: any): void {
  if (item.cra6a_quantidade > 0) {
    item.cra6a_quantidade--;  // Reduz a quantidade do item
    this.httpRequestService.updateEstoqueItem(item).subscribe(
      (response) => {
        this.snackBar.open('Item vendido!!', 'Fechar', {
          duration: 2000,
        });
      },
      (error) => {
        console.error('Erro ao atualizar item no estoque:', error);
      }
    );
  } else {
    this.snackBar.open('Esse item no estoque acabou :( ', 'Fechar', {
      duration: 2000,
    });
  }
}

getAgendamentosBanhoClinicaMes(): void {
  this.httpRequestService.getAgendamentosBanhoClinicaMes().subscribe(
    (response) => {
      this.agendamentosBanhoMes = response.agendamentosBanho;
      this.agendamentosClinicaMes = response.agendamentosClinica;
      this.createComparisonChart();
    },
    (error) => {
      console.error('Erro ao buscar agendamentos de banho e clínica do mês:', error);
    }
  );
}
loadEstoqueItens(): void {
  this.httpRequestService.getEstoqueItens().subscribe(
    (response) => {
      this.estoqueItens = response;  // Armazena os itens de estoque na variável estoqueItens
    },
    (error) => {
      console.error('Erro ao buscar itens de estoque:', error);
    }
  );
}
   // Método para criar o gráfico de faturamento
   createChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    if (this.myChart) {
      this.myChart.destroy();
    }

    this.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.meses,
        datasets: [
          {
            label: 'Faturamento Mensal',
            data: this.faturamentoMensal,
            backgroundColor: 'rgb(244, 95, 19, 0.2)',
            borderColor: 'rgb(244, 95, 19, 1)',
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

  // Método para criar o gráfico de comparação
  createComparisonChart() {
    const ctx = document.getElementById('comparisonChart') as HTMLCanvasElement;

    if (this.comparacaoChart) {
      this.comparacaoChart.destroy();
    }

    this.comparacaoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.meses,
        datasets: [
          {
            label: 'Agendamentos de Banho',
            data: this.agendamentosBanhoMes,
            backgroundColor: 'rgb(107, 218, 78, 0.2)',
            borderColor: 'rgba(107, 218, 78, 1)',
            borderWidth: 1,
          },
          {
            label: 'Agendamentos de Clínica',
            data: this.agendamentosClinicaMes,
            backgroundColor: 'rgba(62, 143, 245, 0.2)',
            borderColor: 'rgba(62, 143, 245, 1)',
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