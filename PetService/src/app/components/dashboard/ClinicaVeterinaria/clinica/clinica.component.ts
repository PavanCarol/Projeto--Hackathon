import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { HttpRequestService } from '../../../../services/http-request.service';
import { CommonModule } from '@angular/common';
import { DialogNewVetComponent } from '../dialog-new-vet/dialog-new-vet.component';
import { Router } from '@angular/router';
import { MenuComponent } from '../../../../menu/menu.component';
@Component({
  selector: 'app-clinica',
  standalone: true,
  imports: [MatTableModule, 
    CommonModule,
    MenuComponent],
  templateUrl: './clinica.component.html',
  styleUrl: './clinica.component.scss',
})
export class ClinicaComponent implements OnInit {
  clinicas: any[] = [];
  currentIndex = 0;

  constructor(
    public dialog: MatDialog,
    private httpService: HttpRequestService,
    private router: Router // Adiciona o Router ao construtor
  ) {}

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialogNewVetComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  ngOnInit(): void {
    this.httpService.getClinicas().subscribe(
      (data) => {
        this.clinicas = data.value;
      },
      (error) => {
        console.error('Erro ao buscar dados das clínicas', error);
      }
    );
  }

  goToInformationVet(clinicaId: string) {
    console.log('Navigating to InformacaoVet with clinicaId:', clinicaId);
    if (clinicaId) {
      this.router.navigate(['/InformacaoVet', clinicaId]);
    } else {
      console.error('Invalid clinicaId:', clinicaId);
    }
  }

  get transformStyle() {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  nextSlide() {
    if (this.currentIndex < this.clinicas.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.clinicas.length - 1;
    }
  }
}
