import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NIP05 } from '../types/nostr';

@Injectable({
    providedIn: 'root',
})
export class Nip05Service {
    constructor(private http: HttpClient) {}

    // url would be something like `brah@npubkey.com`
    // which needs to be processed to make the actual request
    getNIP05Url(url: string): string {
        // https://<domain>/.well-known/nostr.json?name=<local-part>
        const splitUrl = url.split('@');
        const username = splitUrl[0];
        const domain = splitUrl[1];
        return `https://${domain}/.well-known/nostr.json?name=${username}`;
    }

    getNIP05(nip05: string): Observable<NIP05> {
        const url = this.getNIP05Url(nip05);
        return this.http.get<NIP05>(url);
    }
}
