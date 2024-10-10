import { provideAngor } from '@angor';
import { provideHttpClient } from '@angular/common/http';
import {
    APP_INITIALIZER,
    ApplicationConfig,
    inject,
    isDevMode,
} from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    PreloadAllModules,
    provideRouter,
    withInMemoryScrolling,
    withPreloading,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslocoService, provideTransloco } from '@ngneat/transloco';
import { WebLNProvider } from '@webbtc/webln-types';
import { appRoutes } from 'app/app.routes';
import { provideIcons } from 'app/core/icons/icons.provider';
import { firstValueFrom } from 'rxjs';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';
import { navigationServices } from './layout/navigation/navigation.services';
import { HashService } from './services/hash.service';
import { NostrWindow } from './types/nostr';

export function initializeApp(hashService: HashService) {
    return (): Promise<void> => hashService.load();
}
export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [HashService],
            multi: true,
        },
        provideRouter(
            appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
        ),

        // Material Date Adapter Configuration
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'D', // Date format for parsing
                },
                display: {
                    dateInput: 'DDD', // Date format for input display
                    monthYearLabel: 'LLL yyyy', // Format for month-year labels
                    dateA11yLabel: 'DD', // Accessible format for dates
                    monthYearA11yLabel: 'LLLL yyyy', // Accessible format for month-year
                },
            },
        },

        // Transloco Configuration
        provideTransloco({
            config: {
                availableLangs: [
                    {
                        id: 'en',
                        label: 'English',
                    },
                ],
                defaultLang: 'en',
                fallbackLang: 'en',
                reRenderOnLangChange: true,
                prodMode: true,
            },
            loader: TranslocoHttpLoader,
        }),
        {
            // Preload default language before app starts to prevent content issues
            provide: APP_INITIALIZER,
            useFactory: () => {
                const translocoService = inject(TranslocoService);
                const defaultLang = translocoService.getDefaultLang();
                translocoService.setActiveLang(defaultLang);

                return () => firstValueFrom(translocoService.load(defaultLang));
            },
            multi: true,
        },

        // Angor Configuration
        provideIcons(),
        provideAngor({
            mockApi: {
                delay: 0,
                services: navigationServices,
            },
            angor: JSON.parse(localStorage.getItem('angorConfig')) ?? {
                layout: 'classic',
                scheme: 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme: 'theme-brand',
                themes: [
                    { id: 'theme-brand', name: 'Brand' },
                    { id: 'theme-default', name: 'Default' },
                    { id: 'theme-teal', name: 'Teal' },
                    { id: 'theme-rose', name: 'Rose' },
                    { id: 'theme-purple', name: 'Purple' },
                    { id: 'theme-amber', name: 'Amber' },
                ],
            },
        }),
    ],
};
declare global {
    interface Window {
        webln?: WebLNProvider;
        nostr?: NostrWindow;
    }
}
