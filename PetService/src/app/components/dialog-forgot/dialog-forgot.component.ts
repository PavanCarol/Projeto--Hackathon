import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
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
import { MatStepperModule } from '@angular/material/stepper';
import { HttpRequestService } from '../../services/http-request.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-dialog-register',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatStepperModule,
    MatIconModule,
  ],
  templateUrl: './dialog-forgot.component.html',
  styleUrl: './dialog-forgot.component.scss',
})
export class DialogForgotComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  emailValid: boolean = false;
  userId: string = '';

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: HttpRequestService,
    private snackBar: MatSnackBar
  ) {
    this.firstFormGroup = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.secondFormGroup = this._formBuilder.group({
      newPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  verifyEmail(): void {
    const email = this.firstFormGroup.get('email')?.value;
    this.httpService.verifyEmail(email).subscribe(
      (response: any) => {
        if (response.sucesso) {
          this.emailValid = true;
          this.userId = response.userId;
          this.snackBar.open('Email verificado com sucesso', 'Fechar', {
            duration: 2000,
          });
        } else {
          this.snackBar.open('Email não encontrado', 'Fechar', {
            duration: 2000,
          });
        }
      },
      (error: any) => {
        console.error('Erro ao verificar email:', error);
        this.snackBar.open('Erro ao verificar email', 'Fechar', {
          duration: 2000,
        });
      }
    );
  }

  resetPassword(): void {
    if (this.emailValid) {
      const newPassword = this.secondFormGroup.get('newPassword')?.value;
      this.httpService.resetPassword(this.userId, newPassword).subscribe(
        (response: any) => {
          if (response.sucesso) {
            this.snackBar.open('Senha alterada com sucesso', 'Fechar', {
              duration: 2000,
            });
          } else {
            this.snackBar.open('Erro ao alterar senha', 'Fechar', {
              duration: 2000,
            });
          }
        },
        (error: any) => {
          console.error('Erro ao alterar senha:', error);
          this.snackBar.open('Erro ao alterar senha', 'Fechar', {
            duration: 2000,
          });
        }
      );
    }
  }
}
