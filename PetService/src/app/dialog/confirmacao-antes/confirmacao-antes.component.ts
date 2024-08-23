import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmacao-antes',
  template: ` <div class="borda"></div>
    <div class="conteiner">
      <h2 mat-dialog-title>Confirmação</h2>
      <div mat-dialog-content>Tem certeza que deseja excluir este item?</div>

      <div mat-dialog-actions>
        <button mat-button (click)="onNoClick()">Não</button>
        <button mat-button [mat-dialog-close]="true" cdkFocusInitial>
          Sim
        </button>
      </div>
      <div></div>
    </div>`,
  styleUrl: './confirmacao-antes.component.scss',
})
export class ConfirmacaoAntesComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmacaoAntesComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
