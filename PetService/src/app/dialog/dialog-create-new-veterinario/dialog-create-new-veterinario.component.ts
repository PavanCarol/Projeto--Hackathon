import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-create-new-veterinario',
  standalone: true,
  imports: [],
  template: `
  <div class="decoration"></div>
  <div class="All-div">
    <p class="title" mat-dialog-title>
      Sucesso no cadastro</p>
      <div mat-dialog-content class="divP">
        <p>
          O cadastro do novo Veterinário foi feito do Sucesso
        </p>
      </div>
      <div mat-dialog-actions class="btn">
        <button mat-button (click)="onClose()">OK</button>
      </div>
</div>
    `,
  styleUrl: './dialog-create-new-veterinario.component.scss',
})
export class DialogCreateNewVeterinarioComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogCreateNewVeterinarioComponent>,
    private router: Router // Injete o Router aqui
  ) {}
  onClose(): void {
    this.dialogRef.close();
    window.location.reload(); // Força a recarga da página
  }
}
