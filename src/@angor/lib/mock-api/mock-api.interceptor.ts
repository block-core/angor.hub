import { ANGOR_MOCK_API_DEFAULT_DELAY } from '@angor/lib/mock-api/mock-api.constants';
import { AngorMockApiService } from '@angor/lib/mock-api/mock-api.service';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, delay, of, switchMap, throwError } from 'rxjs';
import { AngorMockApiMethods } from './mock-api.types';

/**
 * Mock API interceptor to intercept HTTP requests and return
 * mocked responses if a handler exists for the request.
 */
export const mockApiInterceptor = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const defaultDelay = inject(ANGOR_MOCK_API_DEFAULT_DELAY);
    const angorMockApiService = inject(AngorMockApiService);

    // Try to find a handler for the current request
    const { handler, urlParams } = angorMockApiService.findHandler(
        request.method.toUpperCase() as AngorMockApiMethods,
        request.url
    );

    // If no handler exists, pass the request to the next handler
    if (!handler) {
        return next(request);
    }

    // Set the intercepted request and URL parameters on the handler
    handler.request = request;
    handler.urlParams = urlParams;

    // Subscribe to the response function observable
    return handler.response.pipe(
        delay(handler.delay ?? defaultDelay ?? 0), // Apply handler or default delay
        switchMap((response) => {
            // If no response is returned, generate a 404 error
            if (!response) {
                return throwError(
                    () =>
                        new HttpErrorResponse({
                            error: 'NOT FOUND',
                            status: 404,
                            statusText: 'NOT FOUND',
                        })
                );
            }

            // Parse the response data (status and body)
            const data = {
                status: response[0],
                body: response[1],
            };

            // If status code is between 200 and 300, return a successful response
            if (data.status >= 200 && data.status < 300) {
                return of(
                    new HttpResponse({
                        body: data.body,
                        status: data.status,
                        statusText: 'OK',
                    })
                );
            }

            // For other status codes, throw an error response
            return throwError(
                () =>
                    new HttpErrorResponse({
                        error: data.body?.error,
                        status: data.status,
                        statusText: 'ERROR',
                    })
            );
        })
    );
};
