import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
@Component({
  selector: 'app-information-vet',
  standalone: true,
  imports: [MatSidenavModule, MatDialogModule],
  templateUrl: './information-vet.component.html',
  styleUrl: './information-vet.component.scss',
})
export class InformationVetComponent {}
