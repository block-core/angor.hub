import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

/**
 * Application routes configuration
 */
export const appRoutes: Route[] = [

    // Redirect root path to '/explore'
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'explore'
    },

    // Redirect signed-in user to '/explore'
    {
        path: 'signed-in-redirect',
        pathMatch: 'full',
        redirectTo: 'explore'
    },

    // Routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () => import('app/components/auth/confirmation-required/confirmation-required.routes')
            },
            {
                path: 'forgot-password',
                loadChildren: () => import('app/components/auth/forgot-password/forgot-password.routes')
            },
            {
                path: 'reset-password',
                loadChildren: () => import('app/components/auth/reset-password/reset-password.routes')
            },
            {
                path: 'sign-in',
                loadChildren: () => import('app/components/auth/sign-in/sign-in.routes')
            },
            {
                path: 'sign-up',
                loadChildren: () => import('app/components/auth/sign-up/sign-up.routes')
            }
        ]
    },

    // Routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: { layout: 'empty' },
        children: [
            {
                path: 'sign-out',
                loadChildren: () => import('app/components/auth/sign-out/sign-out.routes')
            },
            {
                path: 'unlock-session',
                loadChildren: () => import('app/components/auth/unlock-session/unlock-session.routes')
            }
        ]
    },



    // Authenticated routes for Angor
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: { initialData: initialDataResolver },
        children: [
            {
                path: 'home',
                loadChildren: () => import('app/components/home/home.routes')
            },
            {
                path: 'explore',
                loadChildren: () => import('app/components/explore/explore.routes')
            },
            {
                path: 'profile',
                loadChildren: () => import('app/components/profile/profile.routes')
            },
            {
                path: 'settings',
                loadChildren: () => import('app/components/settings/settings.routes')
            },
            {
                path: 'chat',
                loadChildren: () => import('app/components/chat/chat.routes')
            },
            {
                path: '404-not-found',
                pathMatch: 'full',
                loadChildren: () => import('app/components/pages/error/error-404/error-404.routes')
            },
            {
                path: '**',
                redirectTo: '404-not-found'
            }
        ]
    }
];
