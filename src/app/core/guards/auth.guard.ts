import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/** 1. Ги штити приватните рути.
 * Ги пренасочува гостите на /login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Користење на сигналот директно за инстантна проверка
  return authService.currentUserSignal() 
    ? true 
    : router.createUrlTree(['/login']);
};

/** * 2. Спречи ги најавените корисници да ги гледаат Login/Register.
 * Пренасочува кон нивниот профил.
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

/** * 3. Безбедносна проверка за уредување.
 * Осигурува дека корисник А не може да го уредува профилот на корисник Б.
 */
export const canEditProfileGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUserSignal();
  const routeId = route.paramMap.get('id');

  // Ако воопшто нема корисник (избришан или одјавен), прати го на login
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // Ако е најавен, провери дали е сопственикот
  if (user && user.uid === routeId) {
    return true;
  }

  // Ако е најавен друг корисник, врати го на неговиот профил или само преглед
  return router.createUrlTree(['/profile', routeId]);
};

