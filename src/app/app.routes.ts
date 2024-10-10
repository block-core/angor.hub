import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { LayoutComponent } from 'app/layout/layout.component';
import { authGuard } from './core/auth/auth.guard';

/**
 * Application routes configuration
 */
export const appRoutes: Route[] = [
    // Redirect root path to '/explore'
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
    },

    {
        path: 'project/:pubkey',
        pathMatch: 'full',
        redirectTo: 'explore',
    },

    // Redirect login user to '/explore'
    {
        path: 'login-redirect',
        pathMatch: 'full',
        redirectTo: 'explore',
    },

    // Routes for guests
    {
        path: '',
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {
                path: 'login',
                loadChildren: () =>
                    import('app/components/auth/login/login.routes'),
            },
            {
                path: 'register',
                loadChildren: () =>
                    import('app/components/auth/register/register.routes'),
            },
        ],
    },

    // Routes for authenticated users
    {
        path: '',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {
                path: 'logout',
                loadChildren: () =>
                    import('app/components/auth/logout/logout.routes'),
            },
        ],
    },

    // Authenticated routes for Angor
    {
        path: '',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        component: LayoutComponent,
        resolve: { initialData: initialDataResolver },
        children: [
            {
                path: 'home',
                loadChildren: () => import('app/components/home/home.routes'),
            },
            {
                path: 'explore',
                loadChildren: () =>
                    import('app/components/explore/explore.routes'),
            },
            {
                path: 'profile',
                loadChildren: () =>
                    import('app/components/profile/profile.routes'),
            },
            {
                path: 'profile/:pubkey',
                loadChildren: () =>
                    import('app/components/profile/profile.routes'),
            },
            {
                path: 'settings',
                loadChildren: () =>
                    import('app/components/settings/settings.routes'),
            },
            {
                path: 'settings/:id',
                loadChildren: () =>
                    import('app/components/settings/settings.routes'),
            },
            {
                path: 'chat',
                loadChildren: () => import('app/components/chat/chat.routes'),
            },
            {
                path: '404-not-found',
                pathMatch: 'full',
                loadChildren: () =>
                    import(
                        'app/components/pages/error/error-404/error-404.routes'
                    ),
            },
            {
                path: '**',
                redirectTo: '404-not-found',
            },
        ],
    },
];
