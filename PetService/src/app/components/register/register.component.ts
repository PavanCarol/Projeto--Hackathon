import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { merge } from 'rxjs';
import { routes } from '../../app.routes';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpRequestService } from '../../services/http-request.service';
import { passwordMatchValidator } from '../../../password-match.validator';
@Component({
  selector: 'app-register',
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
    private httpService: HttpRequestService
  ) {}
  ngOnInit(): void {}
  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    event.stopPropagation();
  }

  cadastrar() {
    // if (this.register.valid) {
    this.httpService.request('/cadastro').subscribe(
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
    // }
  }
}
