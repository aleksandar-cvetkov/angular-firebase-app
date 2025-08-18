import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    MatCardModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _snackBar = inject(MatSnackBar);
  loginForm!: FormGroup

  constructor() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get emailControl() {
    return this.loginForm.get('email') as FormControl
  }

  get passwordControl() {
    return this.loginForm.get('password') as FormControl
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      try {
        await this._authService.login(this.emailControl.value, this.passwordControl.value);
        this._snackBar.open('Login is successful', undefined, { duration: 3000 });
      } catch (err: any) {
        this._snackBar.open('Error', 'Dismiss');
      }
    }
  }
}
