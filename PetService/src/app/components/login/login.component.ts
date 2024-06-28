import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';

import { merge } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogForgotComponent } from '../dialog-forgot/dialog-forgot.component';
import { HttpRequestService } from '../../services/http-request.service';
@Component({
  selector: 'app-login',

  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = new FormControl('', [Validators.required, Validators.email]);
  hide = true;
  errorMessage = '';
  constructor(public dialog: MatDialog, private htp: HttpRequestService) {
    this.htp.getToken();
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }
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

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage = 'Campo obrigatorio*';
    } else if (this.email.hasError('email')) {
      this.errorMessage = 'Email não é valido*';
    } else {
      this.errorMessage = '';
    }
  }
}
