import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirmacao-excluir-categoria',
  template: ` <div class="borda"></div>
    <div class="conteiner">
      <h2 mat-dialog-title>Confirmação</h2>
      <div mat-dialog-content>
        Tem certeza que deseja excluir este tipo de banho?
      </div>

      <div mat-dialog-actions>
        <button mat-button (click)="onNoClick()">Não</button>
        <button mat-button [mat-dialog-close]="true" cdkFocusInitial>
          Sim
        </button>
      </div>
      <div></div>
    </div>`,
  styleUrl: './dialog-confirmacao-excluir-categoria.component.scss',
})
export class DialogConfirmacaoExcluirCategoriaComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmacaoExcluirCategoriaComponent>
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
