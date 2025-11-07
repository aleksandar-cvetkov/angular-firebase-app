import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { canEditProfileGuard } from './auth/can-edit-profile.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register').then(m => m.Register)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./auth/forgot-password/forgot-password').then(m => m.ForgotPassword)
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./auth/reset-password/reset-password').then(m => m.ResetPassword)
    },
    {
        path: 'profile/:id',
        loadComponent: () => import('./user/profile-view/profile-view').then(m => m.ProfileView),
        // canActivate: [authGuard]
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
