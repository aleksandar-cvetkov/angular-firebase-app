import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { getFirebaseErrorMessage } from '../../core/utils/firebase-error-mapper';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule, RouterModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _notificationService = inject(NotificationService);

  isSubmitting = signal(false);

  forgotForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isSubmitting.set(true);
    const { email } = this.forgotForm.getRawValue();

    try {
      await this._authService.forgotPassword(email);
      this._notificationService.showSuccess('Испратен е емаил за ресетирање на лозинка. Ве молиме проверете ја вашата пошта.');
    } catch (err: any) {
      const userMasg = getFirebaseErrorMessage(err);
      this._notificationService.showError(userMasg);
      this.forgotForm.disable();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
