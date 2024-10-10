import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LightningInvoice, LightningResponse } from 'app/types/post';
import { Event } from 'nostr-tools';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class LightningService {
    constructor(private http: HttpClient) {}

    getLightning(url: string): Observable<LightningResponse> {
        return this.http.get<LightningResponse>(url).pipe(
            catchError((error) => {
                console.error('Failed to fetch Lightning response:', error);
                return of({ status: 'Failed' } as LightningResponse);
            })
        );
    }

    getLightningInvoice(
        url: string,
        amount: string
    ): Observable<LightningInvoice> {
        const requestUrl = `${url}?amount=${amount}`;
        return this.http.get<LightningInvoice>(requestUrl).pipe(
            catchError((error) => {
                console.error('Failed to fetch Lightning invoice:', error);
                return of({ pr: '', status: 'Failed' } as LightningInvoice);
            })
        );
    }

    getLightningAddress(url: string): string {
        try {
            const [username, domain] = url.split('@');
            return `https://${domain}/.well-known/lnurlp/${username}`;
        } catch (error) {
            console.error('Invalid Lightning address format:', url);
            return '';
        }
    }

    sendZapRequest(
        callback: string,
        zapRequest: Event,
        amount: string,
        lnurl: string
    ): Observable<LightningInvoice> {
        const event = encodeURIComponent(JSON.stringify(zapRequest));
        const requestUrl = `${callback}?amount=${amount}&nostr=${event}&lnurl=${lnurl}`;
        return this.http.get<LightningInvoice>(requestUrl).pipe(
            catchError((error) => {
                console.error('Failed to send zap request:', error);
                return of({ pr: '', status: 'Failed' } as LightningInvoice);
            })
        );
    }

    async login(): Promise<boolean> {
        try {
            if (window.webln && !window.webln.isEnabled()) {
                await window.webln.enable();
            }
            return true;
        } catch (error) {
            console.error('WebLN login failed:', error);
            return false;
        }
    }

    hasWebln(): boolean {
        return Boolean(window.webln);
    }

    async sendPayment(pr: string): Promise<any> {
        try {
            if (this.hasWebln()) {
                return await window.webln.sendPayment(pr);
            }
            console.error('WebLN is not available');
            return null;
        } catch (error) {
            console.error('Payment failed:', error);
            throw error;
        }
    }

    async payInvoice(pr: string): Promise<boolean> {
        const loggedIn = await this.login();
        if (loggedIn && this.hasWebln()) {
            try {
                const response = await this.sendPayment(pr);
                return Boolean(response);
            } catch (error) {
                console.error('Failed to pay invoice:', error);
                return false;
            }
        }
        console.error('WebLN not available or login failed');
        return false;
    }
}
