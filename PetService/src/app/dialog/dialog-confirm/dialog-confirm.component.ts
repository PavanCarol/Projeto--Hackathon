import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  standalone: true,
  imports: [],
  template: ` <h1 mat-dialog-title>Alterações Salvas</h1>
    <div mat-dialog-content>
      <p>As alterações foram salvas com sucesso.</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onClose()">OK</button>
    </div>`,
  styleUrl: './dialog-confirm.component.scss',
})
export class DialogConfirmComponent {
  constructor(public dialogRef: MatDialogRef<DialogConfirmComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
