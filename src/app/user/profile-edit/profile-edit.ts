import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService } from '../../core/service/user-profile.service';
import { UserProfile } from '../../core/interface/user-profile.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss'
})
export class ProfileEdit {
  private _fb = inject(FormBuilder);
  private profileService = inject(UserProfileService);
  private _snackBar = inject(MatSnackBar);

  selectedFile?: File;
  previewUrl?: string; // ќе ја држи локалната preview слика

  profileForm = this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    profession: [''],
    hobbies: [this._fb.nonNullable.array<string>([])],
    location: [''],
    photoUrl: [''],
  });

  ngOnInit(): void {
    this.profileService.getCurrentUserProfile().subscribe(profile => {
      if (profile) {
        this.profileForm.patchValue(profile);
        this.previewUrl = profile.photoUrl!;
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
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);

      console.log('this.selectedFile ==>> ', this.selectedFile)
    }
  }

  async onSave() {
    if (this.profileForm.valid) {
      console.log('form value ==>> ', this.profileForm.value)
      // if (!this.auth.currentUser) return;
      // const uid = this.auth.currentUser.uid;
      // this.loading = true;

      try {
        let data = { ...this.profileForm.value };

        // ако има селектирана слика → прво upload во Storage
        if (this.selectedFile) {
          const photoUrl = await this.profileService.uploadProfilePhoto(this.selectedFile);
          console.log('photo url ==>> ', photoUrl)
          data = { ...data, photoUrl: photoUrl } as Partial<UserProfile>;
          console.log('data ==>> ', data)
        }

        await this.profileService.updateUserProfile(data);

        this._snackBar.open('Profile updated successfully!', undefined, { duration: 3000 });
      } catch (err) {
        console.error(err);
        this._snackBar.open('Error updating profile', 'Close');
      } finally {
        // this.loading = false;
      }
      // const profile: UserProfile = this.profileForm.value as UserProfile;
      // this.profileService.updateUserProfile(profile)
      //   .then(() => this._snackBar.open('Profile updated successfully!', undefined, { duration: 3000 }))
      //   .catch(err => this._snackBar.open('Error', 'Dismiss'));
    }
  }
}
