import { computed, inject, Injectable, Signal } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { UserProfile } from '../interface/user-profile.interface';
import { Auth, authState, User as FirebaseUser, user as authObservable } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { toSignal } from '@angular/core/rxjs-interop';
import { getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Inject the modular Firestore and Auth services
  private _firestore = inject(Firestore);
  private _auth = inject(Auth);
  private _storage = inject(Storage);

  private currentUserAuthSignal = toSignal(authObservable(this._auth));

  currentUserProfile: Signal<UserProfile | null | undefined> = computed(() => {
    const user = this.currentUserAuthSignal();
    if (!user) {
      return user; // Returns undefined (loading) or null (logged out)
    }

    const userDocRef = doc(this._firestore, `users/${user.uid}`);

    const profileSignal = toSignal(
      docData(userDocRef) as Observable<UserProfile | undefined>,
      { initialValue: undefined }
    );

    // Return the value of the profile signal
    return profileSignal() ?? null;
  });

  // Create / update profile
  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const user = this._auth.currentUser;
    if (!user) throw new Error('No logged in user');

    const userRef = doc(this._firestore, `users/${user.uid}`);
    return setDoc(userRef, profile, { merge: true });
  }

  async getUserProfileById(uid: string): Promise<UserProfile | undefined> {
    const snapshot = await getDoc(doc(this._firestore, `users/${uid}`));
    return snapshot.exists() ? (snapshot.data() as UserProfile) : undefined;
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    const user = this._auth.currentUser;
    if (!user) throw new Error('No logged in user');

    const fileRef = ref(this._storage, `profilePhotos/${user.uid}/${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  }
}
