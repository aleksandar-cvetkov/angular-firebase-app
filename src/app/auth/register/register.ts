import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@angular/fire/auth';
import { getFirebaseErrorMessage } from '../../core/utils/firebase-error-mapper';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html'
})
export class Register {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _notificationService = inject(NotificationService);
  hide = signal(true);

  // 1. Сигнали за состојбата на корисничкиот интерфејс
  hidePassword = signal(true);
  isSubmitting = signal(false);

  // 2. Модерна инициализација на формата
  // со користење на .nonNullable значи дека вредностите секогаш се стрингови, никогаш null
  registerForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    // 3. Реактивна навигација по успешна регистрација
    // Ако има корисник, навигирај до неговиот профил
    effect(() => {
      const user: User | null = this._authService.currentUserSignal();
      if (user) {
        this._router.navigate(['/profile', user.uid]);
      }
    });
  }

  // 4. Промени ја видливоста на лозинката
  togglePassword() {
    this.hidePassword.update((val) => !val);
  }

  get emailControl() {
    return this.registerForm.get('email') as FormControl
  }

  get passwordControl() {
    return this.registerForm.get('password') as FormControl
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.isSubmitting.set(true);
    
    // Земи raw вредности (гарантирано се стрингови поради nonNullable)
    const { email, password } = this.registerForm.getRawValue();

    try {
      await this._authService.register(email, password);
      this._notificationService.showSuccess('Регистрацијата е успешна! Добредојдовте.');
    } catch (err: any) {
      const userMasg = getFirebaseErrorMessage(err);
      this._notificationService.showError(userMasg);
      
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
