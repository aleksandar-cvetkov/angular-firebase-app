import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../core/interface/user-profile.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmPasswordMatcher } from '../../core/utils/error-state-matcher';
import { getFirebaseErrorMessage } from '../../core/utils/firebase-error-mapper';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss'
})
export class ProfileEdit {
  private _fb = inject(FormBuilder);
  private _userService = inject(UserService);
  private _snackBar = inject(MatSnackBar);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _notificationService = inject(NotificationService);

  selectedFile?: File;
  previewUrl = signal<string | null>(null); // ќе ја држи локалната preview слика
  loading = signal(false);

  // Форма за уредување на профил
  profileForm = this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    profession: [''],
    bio: [''],
    location: [''],
    photoUrl: [''],
  });

  // Форма за промена на лозинка
  @ViewChild('passwordFormDirective') passwordFormDirective!: FormGroupDirective;

  confirmMatcher = new ConfirmPasswordMatcher();

  passwordForm = this._fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator, updateOn: 'change' });

  // Validator за споредба на лозинките
  passwordMatchValidator(g: AbstractControl) {
    const pass = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;

    // Враќаме 'mismatch' грешка на ниво на форма
    return pass === confirm ? null : { mismatch: true };
  }

  userProfile = this._userService.currentUserProfile();

  constructor() {
    // This effect runs immediately when the component loads and whenever the user signal changes
    effect(() => {
      const user: User | null = this._authService.currentUserSignal();

      // Check explicitly for null (logged out), allow undefined (loading)
      if (user === null) {
        const id = this._activatedRoute.snapshot.paramMap.get('id');
        this._router.navigate(['/profile', id]);
      }
    });

    // Реактивно ја ажурира формата кога се вчитуваат податоците за корисничкиот профил
    effect(() => {
      const profile = this.userProfile;

      if (profile) {
        // patchValue ги ажурира полињата на формата кои одговараат на клучевите од објектот profile
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          profession: profile.profession,
          bio: profile.bio,
          location: profile.location,
          photoUrl: profile.photoUrl
        }, { emitEvent: false }); // Оневозможи активирање на слушателите на valueChanges ако ги имаш

        // Постави ја локалната preview слика
        this.previewUrl.set(profile.photoUrl || null);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // создавање preview URL
      const reader = new FileReader();
      reader.onload = () => {
        // this.profileForm.patchValue({ photoUrl: reader.result as string });
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(this.selectedFile);
      this.profileForm.markAsDirty();

      console.log('this.selectedFile ==>> ', this.selectedFile)
    }
  }

  onRemovePhoto() {
    this.previewUrl.set(null);
    this.profileForm.markAsDirty();
  }

  async onSave() {
    if (this.profileForm.invalid) return;

    this.loading.set(true);

    try {
      // 1. Prepare Base Data
      // Exclude photoUrl from the raw form value initially
      const { photoUrl, ...formData } = this.profileForm.value;
      let finalData: Partial<UserProfile> = { ...formData };

      // 2. Handle Image Logic
      // Scenario A: New file selected -> Upload it
      if (this.selectedFile) {
        const newPhotoUrl = await this._userService.uploadProfilePhoto(this.selectedFile);
        finalData.photoUrl = newPhotoUrl;
      }
      // Scenario B: No file selected, but preview is NULL (User removed it)
      else if (this.previewUrl() === null) {
        finalData.photoUrl = null;
      }
      // Scenario C: No change (User kept old photo) -> Do not include photoUrl in update
      // (This prevents overwriting the existing URL with null)

      // 3. Update Profile
      await this._userService.updateUserProfile(finalData);

      this._snackBar.open('Profile updated successfully!', undefined, { duration: 3000 });

    } catch (err) {
      console.error(err);
      this._snackBar.open('Error updating profile', 'Close');
    } finally {
      this.loading.set(false);
    }
  }

  async onChangePassword() {
    if (this.passwordForm.invalid) return;
    this.loading.set(true);

    try {
      const newPass = this.passwordForm.value.newPassword!;
      await this._userService.changePassword(newPass);
      this._notificationService.showSuccess('Лозинката е успешно променета!');
      this.passwordForm.reset(); // Ресетирај ги контролите на формата
      setTimeout(() => this.passwordFormDirective.resetForm(), 0); // Ресетирај ја формата во UI
    } catch (err: any) {
      this._notificationService.showError('Грешка: Потребна е повторна најава за оваа операција.');
    } finally {
      this.loading.set(false);
    }
  }

  async onDeleteProfile() {
    const confirm = window.confirm('Дали сте сигурни дека сакате трајно да го избришете профилот? Оваа акција е неповратна.');

    if (confirm) {
      this.loading.set(true);
      try {
        await this._userService.deleteAccount();
        this._router.navigate(['/login']);
      } catch (err: any) {
        const userMasg = getFirebaseErrorMessage(err);
        this._notificationService.showError(userMasg);
      } finally {
        this.loading.set(false);
      }
    }
  }
}
