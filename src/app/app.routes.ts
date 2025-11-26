import { Routes } from '@angular/router';
import { canEditProfileGuard } from './auth/can-edit-profile.guard';
import { redirectLoggedInToProfileGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login),
        canActivate: [redirectLoggedInToProfileGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register').then(m => m.Register),
        canActivate: [redirectLoggedInToProfileGuard]
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
        canActivate: [redirectLoggedInToProfileGuard]
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./auth/reset-password/reset-password').then(m => m.ResetPassword),
        canActivate: [redirectLoggedInToProfileGuard]
    },
    {
        path: 'profile/:id',
        loadComponent: () => import('./user/profile-view/profile-view').then(m => m.ProfileView)
    },
    {
        path: 'profile-edit/:id',
        loadComponent: () => import('./user/profile-edit/profile-edit').then(m => m.ProfileEdit),
        canActivate: [canEditProfileGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
