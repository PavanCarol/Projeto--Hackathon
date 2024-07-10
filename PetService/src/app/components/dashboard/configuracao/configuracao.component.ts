import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequestService } from '../../../services/http-request.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-configuracao',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './configuracao.component.html',
  styleUrl: './configuracao.component.scss'
})
export class ConfiguracaoComponent {
  showInput = false;
  toggleInput(): void {
    this.showInput = !this.showInput;
  }
  pergunta = this.formBuilder.group(
    {
      titulo: [''],
      pergunta: [''],
    },
  );
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpRequestService,
  ) {}
  ngOnInit(): void {}

  Pergunta() {
      const formData = this.pergunta;
      this.httpService.Pergunta(formData).subscribe(
        (response) => {
          if (response.sucesso) {
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
