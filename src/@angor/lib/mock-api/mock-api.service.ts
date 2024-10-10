import { AngorMockApiHandler } from '@angor/lib/mock-api/mock-api.request-handler';
import { AngorMockApiMethods } from '@angor/lib/mock-api/mock-api.types';
import { Injectable } from '@angular/core';
import { fromPairs } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class AngorMockApiService {
    private readonly _handlers: Record<
        AngorMockApiMethods,
        Map<string, AngorMockApiHandler>
    > = {
        get: new Map<string, AngorMockApiHandler>(),
        post: new Map<string, AngorMockApiHandler>(),
        patch: new Map<string, AngorMockApiHandler>(),
        delete: new Map<string, AngorMockApiHandler>(),
        put: new Map<string, AngorMockApiHandler>(),
        head: new Map<string, AngorMockApiHandler>(),
        jsonp: new Map<string, AngorMockApiHandler>(),
        options: new Map<string, AngorMockApiHandler>(),
    };

    /**
     * Find the appropriate handler for a given HTTP method and URL.
     *
     * @param method - The HTTP method (GET, POST, etc.)
     * @param url - The requested URL
     * @returns An object containing the handler and the parsed URL parameters
     */
    findHandler(
        method: AngorMockApiMethods,
        url: string
    ): {
        handler: AngorMockApiHandler | undefined;
        urlParams: Record<string, string>;
    } {
        const matchingHandler = {
            handler: undefined,
            urlParams: {} as Record<string, string>,
        };
        const urlParts = url.split('/');
        const handlers =
            this._handlers[method.toLowerCase() as AngorMockApiMethods];

        for (const [handlerUrl, handler] of handlers) {
            const handlerUrlParts = handlerUrl.split('/');

            if (urlParts.length === handlerUrlParts.length) {
                const matches = handlerUrlParts.every(
                    (part, index) =>
                        part.startsWith(':') || part === urlParts[index]
                );

                if (matches) {
                    matchingHandler.handler = handler;
                    matchingHandler.urlParams = fromPairs(
                        handlerUrlParts
                            .map((part, index) =>
                                part.startsWith(':')
                                    ? [part.substring(1), urlParts[index]]
                                    : undefined
                            )
                            .filter(Boolean)
                    );
                    break;
                }
            }
        }

        return matchingHandler;
    }

    /**
     * Register a GET request handler.
     *
     * @param url - The URL for the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    onGet(url: string, delay?: number): AngorMockApiHandler {
        return this._registerHandler('get', url, delay);
    }

    /**
     * Register a POST request handler.
     *
     * @param url - The URL for the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    onPost(url: string, delay?: number): AngorMockApiHandler {
        return this._registerHandler('post', url, delay);
    }

    /**
     * Register a PATCH request handler.
     *
     * @param url - The URL for the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    onPatch(url: string, delay?: number): AngorMockApiHandler {
        return this._registerHandler('patch', url, delay);
    }

    /**
     * Register a DELETE request handler.
     *
     * @param url - The URL for the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    onDelete(url: string, delay?: number): AngorMockApiHandler {
        return this._registerHandler('delete', url, delay);
    }

    /**
     * Register a PUT request handler.
     *
     * @param url - The URL for the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    onPut(url: string, delay?: number): AngorMockApiHandler {
        return this._registerHandler('put', url, delay);
    }

    /**
     * Register a HEAD request handler.
     *
     * @param url - The URL for the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    onHead(url: string, delay?: number): AngorMockApiHandler {
        return this._registerHandler('head', url, delay);
    }

    /**
     * Register a JSONP request handler.
     *
     * @param url - The URL for the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    onJsonp(url: string, delay?: number): AngorMockApiHandler {
        return this._registerHandler('jsonp', url, delay);
    }

    /**
     * Register an OPTIONS request handler.
     *
     * @param url - The URL for the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    onOptions(url: string, delay?: number): AngorMockApiHandler {
        return this._registerHandler('options', url, delay);
    }

    /**
     * Registers a handler and returns an instance of the handler.
     *
     * @param method - The HTTP method
     * @param url - The URL of the handler
     * @param delay - (Optional) Delay for the response in milliseconds
     * @returns An instance of AngorMockApiHandler
     */
    private _registerHandler(
        method: AngorMockApiMethods,
        url: string,
        delay?: number
    ): AngorMockApiHandler {
        const handler = new AngorMockApiHandler(url, delay);
        this._handlers[method].set(url, handler);
        return handler;
    }
}
