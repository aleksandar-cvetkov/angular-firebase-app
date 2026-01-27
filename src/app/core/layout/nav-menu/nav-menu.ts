import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-nav-menu',
  imports: [MatMenuModule, MatButtonModule, RouterModule],
  templateUrl: './nav-menu.html'
})
export class NavMenu {
  private _authService = inject(AuthService);
  private _router = inject(Router);
  public _userService = inject(UserService);

  // 1. Профил на корисникот
  // Го користиме сигналот од UserService. Овој се ажурира автоматски ако има промени во Firestore.
  profile = this._userService.currentUserProfile;

  // 2. Пресметано име за прикажување
  // Приоритет: Име од профилот -> Прикажано име од Auth -> Емаил -> 'User'
  displayName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    
    // Претпоставаме дека вашиот UserProfile интерфејс има firstName/lastName
    if (p.firstName) return `${p.firstName} ${p.lastName || ''}`;
    
    return p.email || 'User';
  });

  // 3. Одјави се
  logout() {
    this._authService.logout();
  }
}
