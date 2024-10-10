import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class HashService {
    private timestamp: string | null = null;
    private readonly ngswFilePath = '/ngsw.json';

    constructor(private http: HttpClient) {}

    async load(): Promise<void> {
        try {
            const response = await this.http
                .get<{ timestamp: string }>(this.ngswFilePath)
                .toPromise();
            if (response && response.timestamp) {
                this.timestamp = response.timestamp;
                console.log('Timestamp successfully loaded:', this.timestamp);
            } else {
                console.error('Invalid data format in ngsw.json');
            }
        } catch (error) {
            console.error('Error loading ngsw.json:', error);
        }
    }

    getTimestamp(): string | null {
        return this.timestamp;
    }

    loadHash(): Observable<string | null> {
        return this.http.get<{ timestamp: string }>(this.ngswFilePath).pipe(
            map((data) => data.timestamp || null),
            catchError((error) => {
                console.error('Error fetching ngsw.json hash:', error);
                return throwError(() => new Error('Failed to load hash.'));
            })
        );
    }
}
