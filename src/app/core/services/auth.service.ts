import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, confirmPasswordReset, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, user, verifyPasswordResetCode } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _auth: Auth = inject(Auth);
  private _firestore = inject(Firestore);

  /**
   * currentUser е сигнал кој ја рефлектира моменталната состојба на автентикација.
   * Се користи функцијата 'user' од @angular/fire која враќа Observable,
   * а потоа со 'toSignal' се конвертира во сигнал за полесна употреба во компонентите.
   */
  public currentUserSignal = toSignal(user(this._auth), { initialValue: null });

  // Метод за регистрација на нов корисник
  async register(email: string, password: string) {
    // A. Искреирај кориснички акаунт
    const credentials = await createUserWithEmailAndPassword(this._auth, email, password);

    // B. Искреирај почетен документ во Firestore
    // Ова ќе се погрижи UserService.currentUserProfile() да има податоци веднаш!
    const userDocRef = doc(this._firestore, `users/${credentials.user.uid}`);
    await setDoc(userDocRef, {
      uid: credentials.user.uid,
      email: email,
      createdAt: new Date().toISOString(),
      // Додади дифолтни вредности ако е потребно
      firstName: '',
      lastName: '',
      profession: '',
      bio: '',
      location: '',
      photoUrl: ''
    } as any); // Користи 'as any' за да избегнеш проблеми со типизација во оваа фаза

    return credentials.user;
  }

  // Метод за најава на постоечки корисник
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this._auth, email, password);
    return userCredential.user;
  }

  // Испрати имејл за ресетирање на лозинка
  async forgotPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this._auth, email, {
      url: 'http://localhost:4200/reset-password', // URL за враќање по ресетирање
      handleCodeInApp: true // важно за сопствена страница
    });
  }

  // Верификувај го кодот за ресетирање (линкот од имејл)
  async verifyResetCode(code: string): Promise<string> {
    return await verifyPasswordResetCode(this._auth, code);
  }

  // Постави нова лозинка
  async resetPassword(code: string, newPassword: string): Promise<void> {
    return await confirmPasswordReset(this._auth, code, newPassword);
  }

  // Метод за одјавување на корисник
  async logout(): Promise<void> {
    return signOut(this._auth);
  }
}
