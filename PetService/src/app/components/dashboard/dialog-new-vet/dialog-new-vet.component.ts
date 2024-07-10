import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { HttpRequestService } from '../../../services/http-request.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-new-vet',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './dialog-new-vet.component.html',
  styleUrl: './dialog-new-vet.component.scss',
})
export class DialogNewVetComponent {
  clinica = this.formBuilder.group(
    {
      nome: ['', [Validators.required, Validators.minLength(2)]],
      date: ['', [Validators.required]],
      tempoAtuacao: ['', [Validators.required]],
      faculdade: ['', [Validators.required]],
      posGratuacao: [''],
      imagem:[''],
    },
  );
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpRequestService,
  ) {}
  ngOnInit(): void {}
 

  cadastrarVeterinario(){
    if (this.clinica.valid) {
      const formData = this.clinica.value;
      this.httpService.clinica(formData).subscribe(
        (response) => {
          if (response.sucesso) {
            // this.router.navigate(['/']);
           console.log('foi');
          } else {
            console.log(response.mensagem);
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }
}
