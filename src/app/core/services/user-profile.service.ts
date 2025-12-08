import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { UserProfile } from '../interface/user-profile.interface';
import { Auth, authState, User as FirebaseUser } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  // Inject the modular Firestore and Auth services
  private _firestore = inject(Firestore);
  private _auth = inject(Auth);
  private _storage = inject(Storage);
  // private _afs = inject(AngularFirestore);
  // private _auth = inject(AngularFireAuth);

  // Get profile of currently logged user
  getCurrentUserProfile(): Observable<UserProfile | null> {
    return authState(this._auth).pipe(
      switchMap((user: FirebaseUser | null) => {
        if (!user) return of(null);
        // Use doc() and docData() for type-safe document retrieval
        const userDocRef = doc(this._firestore, `users/${user.uid}`);
        return docData(userDocRef).pipe(
          map((profile) => (profile as UserProfile) || null)
        );
      })
    );
  }

  // Create / update profile
  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const user = this._auth.currentUser;
    if (!user) throw new Error('No logged in user');

    const userRef = doc(this._firestore, `users/${user.uid}`);
    return setDoc(userRef, profile, { merge: true });
  }
  // updateUserProfile(profile: Partial<UserProfile>): Observable<void> {
  //   // Use the modular currentUser promise and setDoc() function
  //   const user: FirebaseUser | null = this._auth.currentUser;

  //   if (!user) {
  //     // Return an observable that emits an error or completes
  //     return from(Promise.reject(new Error('Not authenticated')));
  //   }

  //   const userDocRef = doc(this._firestore, `users/${user.uid}`);


  //   return from(setDoc(userDocRef,
  //     {
  //       uid: user.uid,
  //       email: user.email || '',
  //       createdAt: new Date(),
  //       ...profile
  //     },
  //     { merge: true } // merge = update само што сме смениле
  //   ));
  // }

  // Get profile by uid (useful ако гледаме друг профил)
  getUserProfileById(uid: string): Observable<UserProfile | undefined> {
    const userDocRef = doc(this._firestore, `users/${uid}`);
    return docData(userDocRef, { idField: 'uid' }).pipe(
      map((profile) => (profile as UserProfile) || undefined)
    );
  }

  // async updateUserProfile(uid: string, data: any) {
  //   const userDocRef = doc(this.firestore, `users/${uid}`);
  //   await updateDoc(userDocRef, data);
  // }

  async uploadProfilePhoto(file: File): Promise<string> {
    const user = this._auth.currentUser;
    if (!user) throw new Error('No logged in user');

    const fileRef = ref(this._storage, `profilePhotos/${user.uid}/${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  }
}
