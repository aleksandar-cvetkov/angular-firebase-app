import { Component, computed, inject } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-users-list',
  imports: [MatCardModule, RouterModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList {
  private _userService = inject(UserService);
  private _authService = inject(AuthService);

  // 1. Ги влечеме сите корисници
  allUsers = toSignal(this._userService.getAllUsers(5), { initialValue: [] });

  // 2. Ги филтрираме за да го тргнеме тековниот корисник од листата
  filteredUsers = computed(() => {
    const currentUser = this._authService.currentUserSignal();
    return this.allUsers().filter(u => u.uid !== currentUser?.uid);
  });


}
