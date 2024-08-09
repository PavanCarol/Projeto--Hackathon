import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from '../../services/http-request.service';
import { passwordMatchValidator } from '../../../password-match.validator';
import { DialogSucessComponent } from '../../dialog/dialog-sucess/dialog-sucess.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  register = this.formBuilder.group(
    {
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]],
      confirmSenha: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  errorMessage: string = '';
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpRequestService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {}

  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    event.stopPropagation();
  }

  cadastrar() {
    if (this.register.valid) {
      const formData = this.register.value;
      this.httpService.register(formData).subscribe(
        (response) => {
          if (response.sucesso) {
            // this.router.navigate(['/']);
            console.log('foi');
            this.dialog.open(DialogSucessComponent);
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
  onVoltarClick(event: Event): void {
    event.preventDefault(); // Impede o redirecionamento imediato

    const formsElement = document.querySelector('.forms');
    const imageContainerElement = document.querySelector('.image-container');

    if (formsElement && imageContainerElement) {
      formsElement.classList.add('slide-out');
      imageContainerElement.classList.add('slide-out');

      // Aguarde a animação antes de redirecionar
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000); // Duração da animação
    }
  }
}
