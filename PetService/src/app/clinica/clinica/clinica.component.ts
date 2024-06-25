import { Component } from '@angular/core';
import { DialogNewVetComponent } from '../dialog-new-vet/dialog-new-vet.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-clinica',
  standalone: true,
  imports: [],
  templateUrl: './clinica.component.html',
  styleUrl: './clinica.component.scss',
})
export class ClinicaComponent {
  constructor(public dialog: MatDialog) {}
  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialogNewVetComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
