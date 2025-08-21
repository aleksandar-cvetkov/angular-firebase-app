import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
  private _snackBar = inject(MatSnackBar);
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  resetPassForm!: FormGroup;
  oobCode!: string;
  verifiedEmail: string = '';

  constructor() {
    this.resetPassForm = this._fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.oobCode = this._route.snapshot.queryParamMap.get('oobCode')!;
    if (this.oobCode) {
      this._authService.verifyResetCode(this.oobCode)
        .then(email => this.verifiedEmail = email)
        .catch(() => this._snackBar.open('Invalid or expired reset link.', 'Dismiss'));
    }
  }

  onSubmit() {
    if (this.resetPassForm.valid) {
      this._authService.resetPassword(this.oobCode, this.resetPassForm.get('password')?.value)
        .then(() => {
          this._authService.logout();
          this._snackBar.open('Password has been reset.', undefined, { duration: 3000 });
          this._router.navigate(['/login']);
        })
        .catch(err => this._snackBar.open(err.message, 'Dismiss'));      
    }
  }
}
