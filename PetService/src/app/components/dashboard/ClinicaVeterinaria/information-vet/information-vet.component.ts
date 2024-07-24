import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { HttpRequestService } from '../../../../services/http-request.service';
import { MenuComponent } from '../../../../menu/menu.component';
@Component({
  selector: 'app-information-vet',
  standalone: true,
  imports: [
    CommonModule, // Importa CommonModule aqui
    MatDialogModule,
    MatSidenavModule,
    MenuComponent
  ],
  templateUrl: './information-vet.component.html',
  styleUrl: './information-vet.component.scss',
})
export class InformationVetComponent implements OnInit {
  clinica: any;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpRequestService,
    private datePipe: DatePipe  
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.httpService.getClinicaById(id).subscribe(
          (data) => {
            this.clinica = data;
            this.clinica.cra6a_datanascimento = this.datePipe.transform(this.clinica.cra6a_datanascimento, 'yyyy-MM-dd');  // Formate a data
       
          },
          (error) => {
            console.error('Erro ao buscar dados da clínica', error);
          }
        );
      }
    });
  }
}
