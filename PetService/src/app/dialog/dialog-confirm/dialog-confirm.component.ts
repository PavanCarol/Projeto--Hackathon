import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  standalone: true,
  imports: [],
  template: ` 
 <div class="decoration"></div>
 <div class="body">

 <p class="title" mat-dialog-title>Alterações Salvas</p>
    <div mat-dialog-content class="p">
      <p>As alterações foram salvas com sucesso.</p>
      <p>Por favor faça login novamente.</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onClose()">OK</button>
    </div>
</div>
    `,
  styleUrl: './dialog-confirm.component.scss',
})
export class DialogConfirmComponent {
  constructor(public dialogRef: MatDialogRef<DialogConfirmComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
