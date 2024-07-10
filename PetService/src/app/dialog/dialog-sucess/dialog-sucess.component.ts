import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-sucess',
  standalone: true,
  imports: [],
  template: `
<p class="title" mat-dialog-title>Sucesso no cadastrastro!!</p>
<div mat-dialog-content class="divP">
  <p>Por favor, realize o login</p>
</div>
<div mat-dialog-actions class="btn">
  <button mat-button (click)="onClose()">OK</button>
</div>
`,
  styleUrl: './dialog-sucess.component.scss'
})
export class DialogSucessComponent {
  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<DialogSucessComponent> 
  ) {}
  ngOnInit(): void {}
  onClose(): void {
    this.dialogRef.close(); // Fecha o diálogo
    this.router.navigate(['/']);
  }
}
