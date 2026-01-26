import { computed, inject, Injectable, Signal } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { UserProfile } from '../interface/user-profile.interface';
import { Auth, authState, User as FirebaseUser, user as authObservable, user, updatePassword, deleteUser } from '@angular/fire/auth';
import { deleteDoc, doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { toSignal } from '@angular/core/rxjs-interop';
import { getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Инјектирање на модуларните Firestore и Auth сервиси
  private _firestore = inject(Firestore);
  private _auth = inject(Auth);
  private _storage = inject(Storage);

  // src/app/core/services/user.service.ts (Клучна логика)

  // 1. Внатрешен тек (Internal Pipeline)
  // Се користи RxJS за координација на два стрима во реално време.
  private userProfile$ = user(this._auth).pipe(
    switchMap((u) => {
      // Доколку корисникот е најавен, поврзи се со неговиот документ во Firestore
      if (u) {
        // docData враќа Observable кој емитува нова вредност при секоја промена во базата
        return docData(doc(this._firestore, `users/${u.uid}`)) as Observable<UserProfile>;
      }
      // Доколку нема најавен корисник, врати празна вредност
      return of(null);
    })
  );

  // 2. Јавен излез (Public Signal)
  // Стримот се конвертира во Сигнал за компонентите да го конзумираат на наједноставен начин.
  // Ова го задоволува барањето за "Компонента базирана на Сигнали".
  public currentUserProfile = toSignal(this.userProfile$, { initialValue: undefined });

  // Метод за ажурирање на профилот на тековниот корисник
  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const user = this._auth.currentUser;
    if (!user) throw new Error('Нема најавен корисник!');

    const userRef = doc(this._firestore, `users/${user.uid}`);
    return setDoc(userRef, profile, { merge: true });
  }

  async getUserProfileById(uid: string): Promise<UserProfile | undefined> {
    const snapshot = await getDoc(doc(this._firestore, `users/${uid}`));
    return snapshot.exists() ? (snapshot.data() as UserProfile) : undefined;
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    const user = this._auth.currentUser;
    if (!user) throw new Error('Нема најавен корисник!');

    // Креирање референца до патеката во Storage
    const fileRef = ref(this._storage, `profilePhotos/${user.uid}/${file.name}`);

    // Прикачување на бинарните податоци
    await uploadBytes(fileRef, file);

    // Преземање на јавниот URL за приказ
    return await getDownloadURL(fileRef);
  }

  // Метод за промена на лозинката на тековниот корисник
  async changePassword(newPassword: string) {
    const user = this._auth.currentUser;
    if (user) {
      return updatePassword(user, newPassword);
    }
    throw new Error('Нема најавен корисник!');
  }

  // Метод за целосно бришење на корисничка сметка
  async deleteAccount(): Promise<void> {
    const user = this._auth.currentUser;
    if (!user) throw new Error('Корисникот не е најавен');

    return deleteUser(user);
  }
}
