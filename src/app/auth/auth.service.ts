import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
