import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { getFirebaseErrorMessage } from '../../core/utils/firebase-error-mapper';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _notificationService = inject(NotificationService);

  // 1. Loading state signal
  isSubmitting = signal(false);

  // 2. Moder Non-Nullable Form
  forgotForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isSubmitting.set(true);
    const { email } = this.forgotForm.getRawValue();

    try {
      await this._authService.forgotPassword(email);
      this._notificationService.showSuccess('Reset password email sent. Please check your inbox.');
    } catch (err: any) {
      const userMasg = getFirebaseErrorMessage(err);
      this._notificationService.showError(userMasg);
      // Optional: disable form after success to prevent double sends
      this.forgotForm.disable();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
