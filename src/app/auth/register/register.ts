import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@angular/fire/auth';

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
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  // registerForm!: FormGroup;
  hide = signal(true);

  // 1. UI State Signals
  hidePassword = signal(true);
  isSubmitting = signal(false);

  // 2. Modern Form Initialization
  // using .nonNullable means values are always strings, never null
  registerForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    // this.registerForm = this._fb.group({
    //   email: ['', [Validators.required, Validators.email]],
    //   password: ['', [Validators.required, Validators.minLength(8)]],
    //   // confirmPassword: ['', Validators.required]
    // });

    // 3. Reactive Redirection
    // This effect runs immediately when the component loads and whenever the user signal changes
    effect(() => {
      const user: User | null = this._authService.currentUserSignal();
      if (user) {
        this._router.navigate(['/profile', user.uid]);
      }
    });
  }

  // 4. Toggle Visibility
  togglePassword() {
    this.hidePassword.update((val) => !val);
  }

  get emailControl() {
    return this.registerForm.get('email') as FormControl
  }

  get passwordControl() {
    return this.registerForm.get('password') as FormControl
  }

  // onHidePassword() {
  //   this.hide.set(!this.hide());
  // }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    // Start loading state
    this.isSubmitting.set(true);
    
    // Get raw values (guaranteed to be strings due to nonNullable)
    const { email, password } = this.registerForm.getRawValue();

    try {
      await this._authService.register(email, password);
      this._snackBar.open('Registration successful! Welcome.', 'OK', { duration: 3000 });
      // The effect above will handle the navigation automatically
    } catch (err: any) {
      console.error(err);
      
      // Better error handling for users
      let message = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'That email is already registered.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak.';
      }
      
      this._snackBar.open(message, 'Dismiss');
    } finally {
      // Stop loading state regardless of success/error
      this.isSubmitting.set(false);
    }
  }
    // if (this.registerForm.valid) {
    //   console.log(this.registerForm.value);
    //   // TODO: интеграција со Firebase Auth -> createUserWithEmailAndPassword
    //   try {
    //     await this._authService.register(this.emailControl.value, this.passwordControl.value);
    //     this._snackBar.open('Registration is successful.', undefined, { duration: 3000 });
    //   } catch (err: any) {
    //     this._snackBar.open('Error', 'Dismiss');
    //   }
    // }
}
