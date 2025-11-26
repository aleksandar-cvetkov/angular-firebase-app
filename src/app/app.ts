import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatMenuModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-firebase-app');

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
