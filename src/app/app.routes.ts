import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Profile } from './user/profile/profile';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login)
    },
    { path: 'register', component: Register },
    { path: 'change-password', component: ForgotPassword },
    { path: 'profile', component: Profile },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
