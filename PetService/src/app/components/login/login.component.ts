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
import { merge } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogForgotComponent } from '../dialog-forgot/dialog-forgot.component';
import { HttpRequestService } from '../../services/http-request.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DialogErrorComponent } from '../../dialog/dialog-error/dialog-error.component';
import { jwtDecode } from "jwt-decode";
@Component({
  selector: 'app-login',
  standalone: false,

  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });
  hide = true;
  errorMessage: string = '';
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
  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(DialogForgotComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.httpService.login(loginData).subscribe(
        (response) => {
          if (response.sucesso) {
            localStorage.setItem('token', response.token);
  
            try {
              const decodedToken: any = jwtDecode(response.token);
              localStorage.setItem('userName', decodedToken.name);
            } catch (error) {
              console.error('Erro ao decodificar o token', error);
            }
            this.router.navigate(['/home']);
          } else {
            console.error('Credenciais inválidas');
          }
        },
        (error) => {
          console.error('Erro ao fazer login', error);
        }
      );
    }
  }
}