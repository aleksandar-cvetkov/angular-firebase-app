import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@angular/fire/auth';
import { NotificationService } from '../../core/services/notification.service';
import { getFirebaseErrorMessage } from '../../core/utils/firebase-error-mapper';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './login.html'
})
export class Login {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _notificationService = inject(NotificationService)

  // Сигнали за состојбата на корисничкиот интерфејс
  hidePassword = signal(true);
  isSubmitting = signal(false);

  // Иницијализација на формата
  loginForm: FormGroup = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor() {
    // Овој ефект се активира веднаш штом компонентата се вчитува и секогаш кога сигналот за корисникот се менува
    effect(() => {
      const user: User | null = this._authService.currentUserSignal();
      if (user) {
        this._router.navigate(['/profile', user.uid]);
      }
    });
  }

  get emailControl() {
    return this.loginForm.get('email') as FormControl
  }

  get passwordControl() {
    return this.loginForm.get('password') as FormControl
  }

  togglePassword() {
    this.hidePassword.update(hide => !hide);
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isSubmitting.set(true);
    const { email, password } = this.loginForm.getRawValue();
    
    try {
      await this._authService.login(email, password);
      this._notificationService.showSuccess('Најавата е успешна!');
    } catch (err: any) {
      const userMasg = getFirebaseErrorMessage(err);
      this._notificationService.showError(userMasg);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
