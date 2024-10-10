import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Preview } from '../types/preview';

@Injectable({
    providedIn: 'root',
})
export class LinkPreviewService {
    private _accessKey = '5b54e80a65c77848ceaa4630331e8384950e09d392365';
    private _apiURL = 'https://api.linkpreview.net/';

    constructor(private http: HttpClient) {}

    fetchLink(url: string): Observable<Preview> {
        console.log('fetching the following link: ', url);
        const params = new HttpParams()
            .append('key', this._accessKey)
            .append('q', url);

        return this.http
            .get(this._apiURL, { params: params })
            .pipe(map((value) => value as Preview));
    }
}
