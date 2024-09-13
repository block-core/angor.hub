import { InjectionToken } from '@angular/core';

/**
 * Injection token for the default delay of the mock API.
 * This token is used to provide a default delay (in milliseconds)
 * for all mock API requests if no specific delay is set.
 */
export const ANGOR_MOCK_API_DEFAULT_DELAY = new InjectionToken<number>(
    'ANGOR_MOCK_API_DEFAULT_DELAY'
);
