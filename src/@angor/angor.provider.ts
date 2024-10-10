import {
    ANGOR_MOCK_API_DEFAULT_DELAY,
    mockApiInterceptor,
} from '@angor/lib/mock-api';
import { AngorConfig } from '@angor/services/config';
import { ANGOR_CONFIG } from '@angor/services/config/config.constants';
import { AngorConfirmationService } from '@angor/services/confirmation';
import {
    AngorLoadingService,
    angorLoadingInterceptor,
} from '@angor/services/loading';
import { AngorMediaWatcherService } from '@angor/services/media-watcher';
import { AngorPlatformService } from '@angor/services/platform';
import { AngorSplashScreenService } from '@angor/services/splash-screen';
import { AngorUtilsService } from '@angor/services/utils';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    APP_INITIALIZER,
    ENVIRONMENT_INITIALIZER,
    EnvironmentProviders,
    Provider,
    importProvidersFrom,
    inject,
} from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export type AngorProviderConfig = {
    mockApi?: {
        delay?: number;
        services?: any[];
    };
    angor?: AngorConfig;
};

/**
 * Angor provider
 */
export const provideAngor = (
    config: AngorProviderConfig
): Array<Provider | EnvironmentProviders> => {
    const providers: Array<Provider | EnvironmentProviders> = [
        {
            provide: MATERIAL_SANITY_CHECKS,
            useValue: {
                doctype: true,
                theme: false,
                version: true,
            },
        },
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill',
            },
        },
        {
            provide: ANGOR_MOCK_API_DEFAULT_DELAY,
            useValue: config?.mockApi?.delay ?? 0,
        },
        {
            provide: ANGOR_CONFIG,
            useValue: config?.angor ?? {},
        },

        importProvidersFrom(MatDialogModule),
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(AngorConfirmationService),
            multi: true,
        },

        provideHttpClient(withInterceptors([angorLoadingInterceptor])),
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(AngorLoadingService),
            multi: true,
        },

        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(AngorMediaWatcherService),
            multi: true,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(AngorPlatformService),
            multi: true,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(AngorSplashScreenService),
            multi: true,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(AngorUtilsService),
            multi: true,
        },
    ];

    if (config?.mockApi?.services) {
        providers.push(
            provideHttpClient(withInterceptors([mockApiInterceptor])),
            {
                provide: APP_INITIALIZER,
                deps: [...config.mockApi.services],
                useFactory: () => (): any => null,
                multi: true,
            }
        );
    }

    return providers;
};
