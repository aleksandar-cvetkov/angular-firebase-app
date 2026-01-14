import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, confirmPasswordReset, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, user, User, verifyPasswordResetCode } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
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
  private _firestore = inject(Firestore);
  // private _currentUser = signal<User | null>(null);

  // 1. Modern Signal initialization
  // Automatically listens to auth state changes and updates the signal
  public currentUserSignal = toSignal(user(this._auth), { initialValue: null });
  /** ✅ Signal кој секогаш ја има моменталната состојба на најавениот корисник */
  // currentUserSignal = this._currentUser.asReadonly();

  // constructor() {
  //   // слушаме промени на auth state
  //   onAuthStateChanged(this._auth, (user) => {
  //     this._currentUser.set(user);
  //   });
  // }

  // 2. Updated Register logic
  async register(email: string, password: string) {
    // A. Create the Auth Account
    const credentials = await createUserWithEmailAndPassword(this._auth, email, password);

    // B. Create the initial Firestore Document
    // This ensures UserService.currentUserProfile() has data immediately!
    const userDocRef = doc(this._firestore, `users/${credentials.user.uid}`);
    await setDoc(userDocRef, {
      uid: credentials.user.uid,
      email: email,
      createdAt: new Date().toISOString(),
      // Add default values if necessary
      firstName: '',
      lastName: ''
    });

    return credentials.user;

    // return createUserWithEmailAndPassword(this._auth, email, password);
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
