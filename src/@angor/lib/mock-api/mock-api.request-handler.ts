import { AngorMockApiReplyCallback } from '@angor/lib/mock-api/mock-api.types';
import { HttpRequest } from '@angular/common/http';
import { Observable, of, take, throwError } from 'rxjs';

export class AngorMockApiHandler {
    request!: HttpRequest<any>;
    urlParams!: { [key: string]: string };

    // Private
    private _reply: AngorMockApiReplyCallback | undefined;
    private _replyCount = 0;
    private _replied = 0;

    /**
     * Constructor to initialize the handler with a URL and optional delay
     *
     * @param url - The URL for the mock API handler
     * @param delay - Optional delay for the response
     */
    constructor(
        public url: string,
        public delay?: number
    ) {}

    /**
     * Getter for the response observable.
     * Executes the reply callback and returns the result as an observable.
     * If the callback hasn't been set, or request and execution limits are reached, throws an error.
     */
    get response(): Observable<any> {
        // Check if the execution limit has been reached
        if (this._replyCount > 0 && this._replyCount <= this._replied) {
            return throwError(
                () => new Error('Execution limit has been reached!')
            );
        }

        // Ensure the response callback exists
        if (!this._reply) {
            return throwError(
                () => new Error('Response callback function does not exist!')
            );
        }

        // Ensure the request exists
        if (!this.request) {
            return throwError(() => new Error('Request does not exist!'));
        }

        // Increment the replied count
        this._replied++;

        // Execute the reply callback
        const replyResult = this._reply({
            request: this.request,
            urlParams: this.urlParams,
        });

        // Return the result as an observable
        if (replyResult instanceof Observable) {
            return replyResult.pipe(take(1));
        }

        return of(replyResult).pipe(take(1));
    }

    /**
     * Set the reply callback function
     *
     * @param callback - The callback function to generate mock responses
     */
    reply(callback: AngorMockApiReplyCallback): void {
        this._reply = callback;
    }

    /**
     * Set the maximum number of times the mock handler can reply.
     *
     * @param count - The number of allowed replies
     */
    replyCount(count: number): void {
        this._replyCount = count;
    }
}
