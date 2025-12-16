import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../core/interface/user-profile.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    MatIconModule
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

  selectedFile?: File;
  previewUrl = signal<string | null>(null); // ќе ја држи локалната preview слика
  loading = signal(false);

  profileForm = this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    profession: [''],
    bio: [''],
    location: [''],
    photoUrl: [''],
  });

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

    // Reactively updates the form when the user profile data loads
    effect(() => {
      const profile = this.userProfile;

      if (profile) {
        // patchValue updates the form fields that match the profile object keys
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          profession: profile.profession,
          bio: profile.bio,
          location: profile.location,
          photoUrl: profile.photoUrl
        }, { emitEvent: false }); // Prevent triggering valueChanges listeners if you have any

        // Set the local preview signal
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
}
