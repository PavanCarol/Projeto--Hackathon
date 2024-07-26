import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpRequestService } from '../../../../services/http-request.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogNewVeterinarioComponent } from '../dialog-new-veterinario/dialog-new-veterinario.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-clinica-veterinaria',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './clinica-veterinaria.component.html',
  styleUrl: './clinica-veterinaria.component.scss',
})
export class ClinicaVeterinariaComponent implements OnInit {
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
    this.dialog.open(DialogNewVeterinarioComponent, {
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
      this.router.navigate(['/information', clinicaId]);
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
