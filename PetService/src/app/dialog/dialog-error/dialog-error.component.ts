import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-error',
  standalone: true,
  imports: [],
  template: `
  <p class="title" mat-dialog-title>Erro ao fazer o Login</p>
<div mat-dialog-content class="divP">
  <p>OPPS! Parece que não existe esse cadastro</p>
  <p>Por favor,verifique seu login ou crei um cadastro</p>
</div>
<div mat-dialog-actions class="btn">
  <button mat-button (click)="onClose()">OK</button>
</div>`,
  styleUrl: './dialog-error.component.scss'
})
export class DialogErrorComponent {
  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<DialogErrorComponent> 
  ) {}
  onClose(): void {
    this.dialogRef.close();
  }
}
