import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TenorResponse } from 'app/types/gif';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GifService {
    constructor(private http: HttpClient) {}

    getTopGifs(search: string, apiKey: string): Observable<TenorResponse> {
        const url = 'https://g.tenor.com/v1/search';
        const params = new HttpParams()
            .append('key', apiKey)
            .append('q', search);
        return this.http.get<TenorResponse>(url, { params });
    }
}
