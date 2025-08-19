import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { authState } from 'rxfire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _auth: Auth = inject(Auth);
  // private _afAuth = inject(AngularFireAuth);
  user$: Observable<User | null> = authState(this._auth);

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this._auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this._auth, email, password);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this._auth, email);
  }

  logout(): Promise<void> {
    return signOut(this._auth);
  }
}
