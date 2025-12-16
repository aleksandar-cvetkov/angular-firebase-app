import { Component, inject, OnInit, signal, input, resource, computed, effect } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { UserProfile } from '../../core/interface/user-profile.interface';
import { UserService } from '../../core/services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
  private _authService = inject(AuthService);
  private _userService = inject(UserService);

  // 1. Route Param as Signal Input
  // Automatically receives the 'id' from the route path (e.g., /profile/:id)
  // Requires provideRouter(routes, withComponentInputBinding())
  id = input<string>();

  // 2. Resource (The modern replacement for switchMap)
  // Automatically triggers the loader whenever the 'request' signal (this.id) changes.
  profileResource = resource({
    loader: async () => {
      const uid = this.id();
      if (!uid) return null;

      return await this._userService.getUserProfileById(uid);
    }
  });

  // React to id() changes and reload resource
  constructor() {
    effect(() => {
      const uid = this.id();     // track changes
      if (uid) {
        this.profileResource.reload();  // trigger loader again
      }
    });
  }

  // 3. Computed State
  // Expose the value of the resource cleanly
  profile = computed(() => this.profileResource.value() ?? null);

  // Loading state (Bonus: resource gives you isLoading for free)
  isLoading = computed(() => this.profileResource.isLoading());

  // Error state (Bonus: resource captures errors)
  error = computed(() => this.profileResource.error());

  // 4. Ownership Logic
  // Automatically recalculates when either the profile or the authenticated user changes
  isOwner = computed(() => {
    const profile = this.profile();
    const currentUser = this._authService.currentUserSignal(); // Assuming this is a signal

    if (!profile || !currentUser) return false;

    return currentUser?.uid === this.id();
  });
}
