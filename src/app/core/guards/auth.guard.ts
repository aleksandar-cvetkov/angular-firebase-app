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

  // We use the signal directly for a sync check
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

  // If logged in, send them to their profile, else let them see Login
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

  // Verify ID match
  if (user && user.uid === routeId) {
    return true;
  }

  // If it's not their profile, send them back to the view-only version
  return router.createUrlTree(['/profile', routeId]);
};

