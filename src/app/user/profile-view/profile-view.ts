import { Component, inject, input, resource, computed } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
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

  currentUser = this._authService.currentUserSignal;

  // 1. Параметарот од рутата како сигнален влез
  // Автоматски го добива 'id' од патеката на рутата (на пр., /profile/:id)
  // Потребно е да се користи provideRouter(routes, withComponentInputBinding())
  id = input<string>();

  // 2. Resource (Модерна замена за switchMap)
  // Автоматски го активира loader-от секогаш кога се менува сигналот 'request' (this.id).
  profileResource = resource({
    params: () => this.id(),
    loader: async ({params}) => {
      if (!params) return;

      return await this._userService.getUserProfileById(params);
    }
  });

  // 3. Состојба на профилот
  // Пресметано својство што враќа ја вредноста на ресурсот или null ако не е достапна
  profile = computed(() => {
    return this.profileResource.value() ?? null;
  });

  // Состојба која покажува дали ресурсот е во процес на вчитување
  isLoading = computed(() => this.profileResource.isLoading());

  // Состојба која покажува дали има грешка при вчитување на ресурсот
  error = computed(() => this.profileResource.error());

  // 4. Логика за сопственост
  // Автоматски се пресметува кога ќе се промени профилот или автентификуваниот корисник
  isOwner = computed(() => {
    const profile = this.profile();

    if (!profile || !this.currentUser) return false;

    return this.currentUser()?.uid === this.profile()?.uid;
  });

  isLoggedIn = computed(() => !!this.currentUser());
}
