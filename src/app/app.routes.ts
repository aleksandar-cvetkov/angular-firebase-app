import { Routes } from '@angular/router';

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
        path: 'profile',
        loadComponent: () => import('./user/profile/profile').then(m => m.Profile)
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
