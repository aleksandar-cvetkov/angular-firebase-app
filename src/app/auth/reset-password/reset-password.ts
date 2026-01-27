import { Component, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from '../../core/services/notification.service';
import { getFirebaseErrorMessage } from '../../core/utils/firebase-error-mapper';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './reset-password.html'
})
export class ResetPassword {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _notificationService = inject(NotificationService);

  // 1. Автоматско поврзување на параметрите од URL
  // Овој сигнал автоматски ќе го содржи 'oobCode' од URL-то
  oobCode = input<string | null>(null, { alias: 'oobCode' });

  verifiedEmail = signal('');
  isSubmitting = signal(false);
  isValidatingCode = signal(true);

  // 2. Form with Custom "Match" Validator
  resetPassForm = this._fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordsMatchValidator });

  ngOnInit() {
    const code = this.oobCode();
    if (!code) {
      this._notificationService.showError('Не е пронајден код за ресетирање.');
      this._router.navigate(['/login']);
      return;
    }

    // Верифицирај го кодот веднаш
    this._authService.verifyResetCode(code)
      .then(email => {
        this.verifiedEmail.set(email);
        this.isValidatingCode.set(false);
      })
      .catch((err) => {
        this._notificationService.showError('Невалиден или истечен линк за ресетирање.');
        this._router.navigate(['/login']);
      });
  }

  // 3. Валидациска логика за совпаѓање на лозинки
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    return password && confirm && password.value !== confirm.value ? {mismatch: true} : null;
  }

  async onSubmit() {
    const code = this.oobCode();
    if (this.resetPassForm.invalid || !code) return;

    this.isSubmitting.set(true);
    const { password } = this.resetPassForm.getRawValue();
    
    try {
      await this._authService.resetPassword(code, password);
      // Одјави се за да се исчистат сите застарени сесии
      await this._authService.logout(); 
      this._notificationService.showSuccess('Лозинката е ресетирана. Ве молиме најавете се со новата лозинка.');
      this._router.navigate(['/login']);
    } catch (err: any) {
      const errorMsg = getFirebaseErrorMessage(err);
      this._notificationService.showError(errorMsg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
