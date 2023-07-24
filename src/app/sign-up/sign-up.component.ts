import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { PasswordMatchValidator } from 'src/app/sign-up/validators/password-match.validator';
import { UniqueEmailValidator } from 'src/app/sign-up/validators/unique-email.validator';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  private userService = inject(UserService)
  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', {
      asyncValidators: [UniqueEmailValidator(this.userService)],
      validators: [Validators.required, Validators.email],
      updateOn: 'blur'
    }),
    pass: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/)]),
    repeatPass: new FormControl('', [Validators.required]),
  }, { validators: [PasswordMatchValidator] })
  apiProgress = false;
  signUpSuccess = false;


  get usernameError() {
    const field = this.form.get('username')
    if (field?.errors && (field?.touched || field?.dirty)) {
      if (field.errors?.['required'])
        return "Username is required"
      else if (field.errors?.['minlength'])
        return "Username must be at least 4 chars long"
    }
    return null;
  }

  get emailError() {
    const field = this.form.get('email')
    if (field?.errors && (field?.touched || field?.dirty)) {
      if (field.errors?.['required'])
        return "Email is required"
      if (field.errors?.['email'])
        return "Invalid e-mail format"
      if (field.errors?.['uniqueEmail'])
        return "E-mail in use"
      if (field?.errors?.['backendFailure'])
        return field?.errors?.['backendFailure']
    }
    return null;
  }

  get passwordError() {
    const field = this.form.get('pass')
    if (field?.errors && (field?.touched || field?.dirty)) {
      if (field.errors?.['required'])
        return "Password is required"
      if (field.errors?.['pattern'])
        return "Password should fit pattern"
    }
    return null;
  }
  get passwordRepeatError() {
    if (this.form?.errors && (this.form?.touched || this.form?.dirty)) {
      if (this.form.errors?.['passwordMatch'])
        return "Passwords missmatched"
    }
    return null;
  }

  onClickSignUp() {
    this.apiProgress = true;
    this.userService.signUp({ username: this.form.get('username')?.value as string, email: this.form.get('email')?.value as string, password: this.form.get('pass')?.value as string }).subscribe({
      next: () => {
        this.apiProgress = false;
        this.signUpSuccess = true;
      },
      error: (httpError: HttpErrorResponse) => {
        const emailValidationErrorMessage = httpError.error?.validationErrors?.email;
        this.form.get('email')?.setErrors({ backendFailure: emailValidationErrorMessage })
        this.apiProgress = false;
      }
    })
  }

  isDisabled() {
    const formFilled = !!this.form.get('username')?.value && !!this.form.get('email')?.value && !!this.form.get('pass')?.value && !!this.form.get('repeatPass')?.value

    const validationError = this.usernameError || this.emailError || this.passwordError || this.passwordRepeatError;
    return !formFilled || !!validationError || this.apiProgress
  }
}
