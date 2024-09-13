import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Kind0Content } from '../types/user';
import { withCache } from '@ngneat/cashew';

interface Profile {
    pubkey: string;
    new_followers_count: number;
    relays: Array<string>;
    profile: Kind0Content
}

@Injectable({
  providedIn: 'root'
})
export class NostrBandApiService {

    baseUrl: string = "https://api.nostr.band/";

    trending: string = "v0/trending/";
    profiles: string = "profiles";
    notes: string = "notes";

    constructor(
        private http: HttpClient
    ) { }

    getTrendingProfiles(): Observable<JSON>{
        const url = `${this.baseUrl}${this.trending}${this.profiles}`;
        return this.http.get<JSON>(url, {context: withCache()});
    }

    getTrendingNotes(): Observable<JSON>{
        const url = `${this.baseUrl}${this.trending}${this.notes}`;
        return this.http.get<JSON>(url, {context: withCache()});
    }
}
