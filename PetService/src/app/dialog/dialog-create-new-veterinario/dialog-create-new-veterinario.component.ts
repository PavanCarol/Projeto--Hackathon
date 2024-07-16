import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-create-new-veterinario',
  standalone: true,
  imports: [],
  template: ` <div class="divGif">
      <img src="img/gifs/feliz.gif" alt="image" class="img" />
    </div>
    <h1 mat-dialog-title>Sucesso ao cadastrar um novo Veterinário!!</h1>
    <div mat-dialog-content class="divP">
      <p style="font-size: 21px;font-weight: 600;">
        O cadastro foi feito com sucesso
      </p>
    </div>
    <div mat-dialog-actions class="btn">
      <button mat-button (click)="onClose()">OK</button>
    </div>`,
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
