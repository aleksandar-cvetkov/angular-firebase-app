import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Matcher кој проверува дали лозинките се совпаѓаат на ниво на цела форма
 */
export class ConfirmPasswordMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    const isInvalid = control?.invalid;
    const isMismatch = form?.hasError('mismatch'); // Проверува грешка на ниво на форма

    // Полето ќе поцрвени ако: е празно, ако формата е пратена, или ако лозинките не се совпаѓаат
    return !!(control && (isInvalid || isMismatch) && (control.dirty || control.touched || isSubmitted));
  }
}