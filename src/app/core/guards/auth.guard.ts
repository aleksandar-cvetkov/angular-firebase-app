import { CanActivateFn, Router } from '@angular/router';
import { first, map } from 'rxjs/operators';
import { AuthService } from '../core/service/auth.service';
import { inject } from '@angular/core';
import {
  canActivate,
  redirectUnauthorizedTo,
  redirectLoggedInTo
} from '@angular/fire/compat/auth-guard';
import { Auth, user } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

// const auth = inject(AuthService);

/**
 * Guard that protects routes that require authentication (e.g., /profile-edit).
 * Redirects unauthorized users to the login page.
*/
export const authGuard: CanActivateFn = (route, state) => {
  const currentUser$ = user(inject(Auth));
  const router = inject(Router);

  // Using map on the observable is a cleaner way to handle redirects for protected routes
  return currentUser$.pipe(
    map(user => {
      if (user) {
        console.log('✅ корисникот е најавен => ', user);
        // auth.logout();
        return true; // User is logged in, allow access
      } else {
        // User is not logged in, redirect to login page
        return router.createUrlTree(['/login']);
        // return false;
      }
    })
  );
};

/**
 * Guard that redirects logged-in users away from public-only routes (login, register)
 * to their specific profile page (/profile/:id).
 */
export const redirectLoggedInToProfileGuard: CanActivateFn = async (route, state) => {
  const currentUser$ = user(inject(Auth));
  const router = inject(Router);
  
  const currentUser = await firstValueFrom(currentUser$);

  if (currentUser) {
    return router.createUrlTree(['/profile', currentUser.uid]);
  }

  return true; // Allow non-logged-in users to proceed
}

export const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
// export const redirectLoggedInToProfile = () => redirectLoggedInTo(['/profile']);
