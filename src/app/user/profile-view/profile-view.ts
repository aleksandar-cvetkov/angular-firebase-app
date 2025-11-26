import { Component, inject, OnInit, signal } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { UserProfile } from '../../core/interface/user-profile.interface';
import { UserProfileService } from '../../core/service/user-profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.scss'
})
export class ProfileView {
  // userProfile$!: Observable<UserProfile | null>;

  private _route = inject(ActivatedRoute);
  private _authService = inject(AuthService);
  private _userProfileService = inject(UserProfileService);

  profile = signal<UserProfile | null>(null);
  isOwner = signal(false);
  currentUser = this._authService.currentUserSignal;

  constructor() {
    this._route.paramMap.pipe(switchMap(params => {
      const id = params.get('id');
      console.log('ProfileView: Loaded profile for ID:', id);
      return this._userProfileService.getUserProfileById(id!).pipe(map(profile => ({ id, profile })));
    })).subscribe(({ id, profile }) => {
      console.log('ProfileView: Fetched profile data:', profile);
      this.profile.set(profile!);

      this.isOwner.set(this.currentUser()?.uid === id);
    });
  }

  // ngOnInit(): void {
  //   this.userProfile$ = this._userProfileService.getCurrentUserProfile();

  //   this.userProfile$.subscribe(value => {
  //     console.log('userProfile value:', value);
  //   });
  // }
}
