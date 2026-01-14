import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-nav-menu',
  imports: [MatMenuModule, MatButtonModule, RouterModule],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.scss'
})
export class NavMenu {
  private _authService = inject(AuthService);
  private _router = inject(Router);
  public _userService = inject(UserService);

  // 1. Source of Truth: The Rich Profile
  // We use the signal from UserService. This updates automatically if Firestore changes.
  profile = this._userService.currentUserProfile;

  // 2. Computed Display Name
  // Priority: Profile Name -> Auth Display Name -> Email -> 'User'
  displayName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    
    // Assuming your UserProfile interface has firstName/lastName
    if (p.firstName) return `${p.firstName} ${p.lastName || ''}`;
    
    return p.email || 'User';
  });

  // 3. Logout
  logout() {
    this._authService.logout();
    // Optional: Navigate to home/login after logout if the service doesn't do it
  }

  // user = this._authService.currentUserSignal;

  // userId = computed(() => this.user()?.uid);
  // userEmail = computed(() => this.user()?.email);
  // userName = computed(() => this.user()?.displayName || '' );

  // goToProfile() {
  //   if (!this.userId()) return;
  //   this._router.navigate(['profile', this.userId()]);
  // }

  // goToEditProfile() {
  //   if (!this.userId()) return;
  //   this._router.navigate(['profile-edit', this.userId()]);
  // }

  // logout() {
  //   this._authService.logout();
  // }
}
