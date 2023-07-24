import { inject } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { Observable, catchError, map, of, tap } from "rxjs";
import { UserService } from "src/app/core/user/user.service";

export const UniqueEmailValidator = (userService: UserService): AsyncValidatorFn => (control: AbstractControl): Observable<ValidationErrors | null> => {
  const email = control.value as string;
  return userService.isEmailTaken(email).pipe(
    map((_) => _ ? { uniqueEmail: true } : null),
    catchError(() => of(null)),
  )
}