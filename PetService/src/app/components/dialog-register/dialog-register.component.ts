import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
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
import { merge } from 'rxjs';
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
    MatIconModule,
  ],
  templateUrl: './dialog-register.component.html',
  styleUrl: './dialog-register.component.scss',
})
export class DialogRegisterComponent {
  email = new FormControl('', [Validators.required, Validators.email]);
  hide = true;
  errorMessage = '';
  constructor() {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }
  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    event.stopPropagation();
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
