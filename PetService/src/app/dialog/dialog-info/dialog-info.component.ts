import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-info',
  template: `
    <div class="borda"></div>
    <div class="conteiner">
      <h3 mat-dialog-title>Detalhes do Agendamento</h3>
      <div mat-dialog-content>
        <p><strong>Nome do dono:</strong> {{ data.donoPetNome }}</p>
        <p>
          <strong>Categoria de banho:</strong>
          {{ getBanhoOuTosaNome(data.cra6a_banhooutosa) }}
        </p>
        <p>
          <strong>Custo:</strong>
          {{
            data.cra6a_custo?.cra6a_valor | currency : 'BRL' || 'Indisponível'
          }}
        </p>

        <p>
          <strong>Acessório:</strong>
          {{ data.cra6a_enfeite ? 'Sim' : 'Não' }}
        </p>
        <p>
          <strong>Perfume:</strong> {{ data.cra6a_perfume ? 'Sim' : 'Não' }}
        </p>
        <p>
          <strong>Data e Hora:</strong>
          {{ formatarDataHora(data.cra6a_databanhotosa) }}
        </p>
      </div>
    </div>
    <div mat-dialog-actions class="fechar">
      <button mat-button mat-dialog-close (click)="fecharDialog()">
        Fechar
      </button>
    </div>
  `,
  styleUrls: ['./dialog-info.component.scss'],
})
export class DialogInfoComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogInfoComponent>
  ) {}

  getBanhoOuTosaNome(valor: number): string {
    const nomes: { [key: number]: string } = {
      1: 'Banho',
      2: 'Tosa',
      3: 'Banho e Tosa',
      4: 'Tosa completa',
      5: 'Tosa higiênica',
    };
    return nomes[valor] || 'Desconhecido';
  }

  formatarDataHora(dataHora: string): string {
    const data = new Date(dataHora);
    return (
      data.toLocaleDateString('pt-BR') +
      ' ' +
      data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  }
  fecharDialog(): void {
    this.dialogRef.close();
  }
}
