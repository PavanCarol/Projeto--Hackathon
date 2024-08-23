import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmacao-antesveterinario',
  template: `
  <div class="borda"></div>
    <div class="conteiner">
      <h2 mat-dialog-title>Confirmação</h2>
      <div mat-dialog-content>Tem certeza que deseja excluir este Veterinario?</div>

      <div mat-dialog-actions>
        <button mat-button (click)="onNoClick()">Não</button>
        <button mat-button [mat-dialog-close]="true" cdkFocusInitial>
          Sim
        </button>
      </div>
      <div></div>
    </div>
  `,
  styleUrl: './confirmacao-antesveterinario.component.scss'
})
export class ConfirmacaoAntesveterinarioComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmacaoAntesveterinarioComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
