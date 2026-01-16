import { Routes } from '@angular/router';
import { authGuard, canEditProfileGuard, redirectLoggedInGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login),
        canActivate: [redirectLoggedInGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register').then(m => m.Register),
        canActivate: [redirectLoggedInGuard]
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
        canActivate: [redirectLoggedInGuard]
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./auth/reset-password/reset-password').then(m => m.ResetPassword),
        canActivate: [redirectLoggedInGuard]
    },
    {
        path: 'profile/:id',
        loadComponent: () => import('./user/profile-view/profile-view').then(m => m.ProfileView)
    },
    {
        path: 'profile-edit/:id',
        loadComponent: () => import('./user/profile-edit/profile-edit').then(m => m.ProfileEdit),
        canActivate: [authGuard, canEditProfileGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
