import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const canEditProfileGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUserSignal();
  const routeId = route.paramMap.get('id');

  if (currentUser && currentUser.uid === routeId) {
    return true;
  } else {
    return router.navigate(['/profile', routeId]);
    // return false;
  }
};