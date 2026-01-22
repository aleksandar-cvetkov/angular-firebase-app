import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** * 1. Protects private routes.
 * Redirects guests to /login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Користење на сигналот директно за инстантна проверка
  return authService.currentUserSignal() 
    ? true 
    : router.createUrlTree(['/login']);
};

/** * 2. Prevent logged-in users from seeing Login/Register.
 * Redirects to their own profile.
 */
export const redirectLoggedInGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.currentUserSignal();

  // Ако е веќе најавен, пренасочи го директно на неговиот профил
  return user 
    ? router.createUrlTree(['/profile', user.uid]) 
    : true;
};

/** * 3. Security check for editing.
 * Ensures User A cannot edit User B's profile.
 */
export const canEditProfileGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUserSignal();
  const routeId = route.paramMap.get('id');

  // Проверка: Дали најавениот корисник е ист со корисникот во URL-то?
  if (user && user.uid === routeId) {
    return true;
  }

  // Ако не е сопственик, врати го на преглед (read-only)
  return router.createUrlTree(['/profile', routeId]);
};

