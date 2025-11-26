import { inject, Injectable, NgZone, signal } from '@angular/core';
import { Auth, confirmPasswordReset, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User, verifyPasswordResetCode } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { authState } from 'rxfire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _auth: Auth = inject(Auth);
  private _currentUser = signal<User | null>(null);
  private _router = inject(Router);
  private _ngZone = inject(NgZone);
  // private _afAuth = inject(AngularFireAuth);
  user$: Observable<User | null> = authState(this._auth);

  constructor() {
    // слушаме промени на auth state
    onAuthStateChanged(this._auth, (user) => {
      this._currentUser.set(user);

      // this._ngZone.run(() => {
        // if (user) {
        //   console.log('✅ корисникот е најавен => ', user);
        //   this._router.navigate(['profile', user.uid]);
        // } else {
        //   console.log('✅ корисникот не е најавен');
        //   this._router.navigate(['login']);
        // }
      // });
    });
  }

  /** ✅ Signal кој секогаш ја има моменталната состојба на најавениот корисник */
  currentUserSignal = this._currentUser.asReadonly();
  // currentUserSignal() {
  //   return this._currentUser();
  // }

  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this._auth, email, password);
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this._auth, email, password);
    return userCredential.user;
  }

  async forgotPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this._auth, email, {
      url: 'http://localhost:4200/reset-password', // redirect URL
      handleCodeInApp: true // важно за сопствена страница
    });
  }

  // Verify reset code (линкот од email)
  async verifyResetCode(code: string): Promise<string> {
    return await verifyPasswordResetCode(this._auth, code);
  }

  // Set new password
  async resetPassword(code: string, newPassword: string): Promise<void> {
    return await confirmPasswordReset(this._auth, code, newPassword);
  }

  async logout(): Promise<void> {
    return signOut(this._auth);
  }
}
