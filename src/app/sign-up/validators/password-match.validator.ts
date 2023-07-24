import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export const PasswordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('pass');
  const repeatPassword = control.get('repeatPass');
  return password?.value === repeatPassword?.value ? null : {
    passwordMatch: true
  }
}

