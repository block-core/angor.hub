import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    constructor(private readonly httpClient: HttpClient) {}

    /**
     * Get translation data for the specified language
     *
     * @param lang Language code
     */
    getTranslation(lang: string): Observable<Translation> {
        const translationUrl = `./i18n/${lang}.json`;
        return this.httpClient.get<Translation>(translationUrl);
    }
}
