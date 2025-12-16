import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-nav-menu',
  imports: [MatMenuModule, MatButtonModule],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.scss'
})
export class NavMenu {
  private _authService = inject(AuthService);
  private _router = inject(Router);

  user = this._authService.currentUserSignal;

  userId = computed(() => this.user()?.uid);
  userEmail = computed(() => this.user()?.email);
  userName = computed(() => this.user()?.displayName || '' );

  goToProfile() {
    if (!this.userId()) return;
    this._router.navigate(['profile', this.userId()]);
  }

  goToEditProfile() {
    if (!this.userId()) return;
    this._router.navigate(['profile-edit', this.userId()]);
  }

  logout() {
    this._authService.logout();
  }
}
