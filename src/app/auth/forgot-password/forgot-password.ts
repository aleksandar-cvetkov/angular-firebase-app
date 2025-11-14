import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

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
  private _snackBar = inject(MatSnackBar);
  forgotForm!: FormGroup;  

  constructor() {
    this.forgotForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotForm.valid) {
      console.log(this.forgotForm.value);
      try {
        await this._authService.forgotPassword(this.forgotForm.get('email')?.value);
        this._snackBar.open('Reset password email sent. Check your inbox.', undefined, { duration: 3000 });
      } catch (err: any) {
        this._snackBar.open('Error', 'Dismiss');
      }
    }
  }
}
