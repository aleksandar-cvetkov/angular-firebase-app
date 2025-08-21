import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  return auth.user$.pipe(
    map(user => {
      if (user) {
        console.log('✅ корисникот е најавен => ', user);
        // auth.logout();
        return true; // ✅ корисникот е најавен
      } else {
        router.navigate(['/login']);
        return false; // ❌ не е најавен
      }
    })
  );
};
