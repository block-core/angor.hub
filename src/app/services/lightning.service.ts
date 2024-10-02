import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LightningResponse, LightningInvoice } from '../types/post';
import { Event } from 'nostr-tools';

@Injectable({
  providedIn: 'root',
})
export class LightningService {
  constructor(private http: HttpClient) {}

  getLightning(url: string): Observable<LightningResponse> {
    return this.http
      .get<LightningResponse>(url)
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch Lightning data:', error);
          return of({ status: 'Failed' } as LightningResponse);
        })
      );
  }

  getLightningInvoice(url: string, amount: string): Observable<LightningInvoice> {
    const fullUrl = `${url}?amount=${amount}`;
    return this.http.get<LightningInvoice>(fullUrl).pipe(
      catchError((error) => {
        console.error('Failed to fetch Lightning invoice:', error);
        return of(null as unknown as LightningInvoice);
      })
    );
  }

  getLightningAddress(url: string): string {
    const [username, domain] = url.split('@');
    return `https://${domain}/.well-known/lnurlp/${username}`;
  }

  sendZapRequest(
    callback: string,
    zapRequest: Event,
    amount: string,
    lnurl: string
  ): Observable<LightningInvoice> {
    const encodedEvent = encodeURIComponent(JSON.stringify(zapRequest));
    const url = `${callback}?amount=${amount}&nostr=${encodedEvent}&lnurl=${lnurl}`;
    return this.http.get<LightningInvoice>(url).pipe(
      catchError((error) => {
        console.error('Failed to send zap request:', error);
        return of(null as unknown as LightningInvoice);
      })
    );
  }

  async login(): Promise<boolean> {
    if (window.webln && !window.webln.isEnabled()) {
      try {
        await window.webln.enable();
        return true;
      } catch (error) {
        console.error('Failed to enable WebLN:', error);
        return false;
      }
    }
    return !!window.webln;
  }

  hasWebln(): boolean {
    return !!window.webln;
  }

  async sendPayment(paymentRequest: string): Promise<any> {
    try {
      return await window.webln?.sendPayment(paymentRequest);
    } catch (error) {
      console.error('Failed to send payment:', error);
      return null;
    }
  }

  async payInvoice(paymentRequest: string): Promise<boolean> {
    const isLoggedIn = await this.login();
    if (!isLoggedIn) {
      console.error('WebLN is not available');
      return false;
    }

    const response = await this.sendPayment(paymentRequest);
    return response !== null;
  }
}
