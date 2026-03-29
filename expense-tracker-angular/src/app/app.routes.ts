import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginDialog } from './components/auth/login-dialog/login-dialog';
import { SignUpDialog } from './components/auth/sign-up-dialog/sign-up-dialog';
import { DashboardPage } from './components/dashboard/dashboard-page/dashboard-page';

export const routes: Routes = [
    { path: 'login', component: LoginDialog },
    { path: 'sign-up', component: SignUpDialog },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] }
];
