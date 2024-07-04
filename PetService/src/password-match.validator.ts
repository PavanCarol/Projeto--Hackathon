import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const senha = control.get('senha');
  const confirmSenha = control.get('confirmSenha');

  if (senha && confirmSenha && senha.value !== confirmSenha.value) {
    return { passwordsMismatch: true };
  }
  return null;
};
