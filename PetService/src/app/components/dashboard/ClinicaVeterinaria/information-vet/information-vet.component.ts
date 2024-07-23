import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { HttpRequestService } from '../../../../services/http-request.service';
@Component({
  selector: 'app-information-vet',
  standalone: true,
  imports: [
    CommonModule, // Importa CommonModule aqui
    MatDialogModule,
    MatSidenavModule,
  ],
  templateUrl: './information-vet.component.html',
  styleUrl: './information-vet.component.scss',
})
export class InformationVetComponent implements OnInit {
  clinica: any;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpRequestService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.httpService.getClinicaById(id).subscribe(
          (data) => {
            this.clinica = data;
          },
          (error) => {
            console.error('Erro ao buscar dados da clínica', error);
          }
        );
      }
    });
  }
}
