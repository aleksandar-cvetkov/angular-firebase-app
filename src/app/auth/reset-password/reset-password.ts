import { Component, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _notificationService = inject(NotificationService);
  private _route = inject(ActivatedRoute);
  private _snackBar = inject(MatSnackBar);
  // resetPassForm!: FormGroup;
  // oobCode!: string;
  // verifiedEmail: string = '';

  // 1. Automatic Query Param Binding
  // This signal will automatically contain the 'oobCode' from the URL
  oobCode = input<string | null>(null, { alias: 'oobCode' });

  verifiedEmail = signal('');
  isSubmitting = signal(false);
  isValidatingCode = signal(true);

  // 2. Form with Custom "Match" Validator
  resetPassForm = this._fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordsMatchValidator });

  // constructor() {
  //   this.resetPassForm = this._fb.group({
  //     password: ['', [Validators.required, Validators.minLength(6)]],
  //     confirmPassword: ['', Validators.required]
  //   });
  // }

  ngOnInit() {
    const code = this.oobCode();
    if (!code) {
      this._notificationService.showError('No reset code found.');
      this._router.navigate(['/login']);
      return;
    }

    // Verify the code immediately
    this._authService.verifyResetCode(code)
      .then(email => {
        this.verifiedEmail.set(email);
        this.isValidatingCode.set(false);
      })
      .catch((err) => {
        this._notificationService.showError('Invalid or expired reset link.');
        this._router.navigate(['/login']);
      });
  }

  // 3. Custom Validator Logic
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    return password && confirm && password.value !== confirm.value ? {mismatch: true} : null;
  }
    // this.oobCode = this._route.snapshot.queryParamMap.get('oobCode')!;
    // if (this.oobCode) {
    //   this._authService.verifyResetCode(this.oobCode)
    //     .then(email => this.verifiedEmail = email)
    //     .catch(() => this._snackBar.open('Invalid or expired reset link.', 'Dismiss'));
    // }

  async onSubmit() {
    const code = this.oobCode();
    if (this.resetPassForm.invalid || !code) return;

    this.isSubmitting.set(true);
    const { password } = this.resetPassForm.getRawValue();
    
    try {
      await this._authService.resetPassword(code, password);
      // Logout to clear any stale sessions
      await this._authService.logout(); 
      this._notificationService.showSuccess('Password has been reset. Please log in with your new password.');
      this._router.navigate(['/login']);
    } catch (err: any) {
      const errorMsg = getFirebaseErrorMessage(err);
      this._notificationService.showError(errorMsg);
    } finally {
      this.isSubmitting.set(false);
    }

    // if (this.resetPassForm.valid) {
    //   this._authService.resetPassword(this.oobCode, this.resetPassForm.get('password')?.value)
    //     .then(() => {
    //       this._authService.logout();
    //       this._snackBar.open('Password has been reset.', undefined, { duration: 3000 });
    //       this._router.navigate(['/login']);
    //     })
    //     .catch(err => this._snackBar.open(err.message, 'Dismiss'));
    // }
  }
}
