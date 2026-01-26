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

  // 1. Ако воопшто нема корисник (избришан или одјавен), прати го на login
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // 2. Ако е најавен, провери дали е сопственикот
  if (user && user.uid === routeId) {
    return true;
  }

  // 3. Ако е најавен друг корисник, врати го на неговиот профил или само преглед
  return router.createUrlTree(['/profile', routeId]);
};

