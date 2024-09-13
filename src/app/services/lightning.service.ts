import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LightningResponse, LightningInvoice } from '../types/post';
import { Event } from 'nostr-tools';


@Injectable({
  providedIn: 'root'
})
export class LightningService {

    constructor(
        private http: HttpClient
    ) { }

    getLightning(url: string): Observable<LightningResponse> {
        return this.http.get<LightningResponse>(url)
            .pipe(
                catchError(() => of({status: "Failed"} as LightningResponse))
            )
    }

    getLightningInvoice(url: string, amount: string): Observable<LightningInvoice> {
        // amount is in millisats so 5 sats === 5000
        let aUrl = `${url}?amount=${amount}`;
        return this.http.get<LightningInvoice>(aUrl);
    }

    // url would be something like `brah@npubkey.com`
    // which needs to be processed to make the actual request
    getLightningAddress(url: string): string {
        const splitUrl = url.split("@");
        const username = splitUrl[0];
        const domain = splitUrl[1];
        return `https://${domain}/.well-known/lnurlp/${username}`;
    }

    /* 
    example http post to callback if nostr allowed
    {
        "kind": 9734,
        "content": "Zap!",
        "tags": [
            ["relays", "wss://nostr-pub.wellorder.com"],
            ["amount", "21000"],
            ["lnurl", "lnurl1dp68gurn8ghj7um5v93kketj9ehx2amn9uh8wetvdskkkmn0wahz7mrww4excup0dajx2mrv92x9xp"],
            ["p", "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9"],
            ["e", "9ae37aa68f48645127299e9453eb5d908a0cbb6058ff340d528ed4d37c8994fb"]
        ],
        "pubkey": "97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322",
        "created_at": 1679673265,
        "id": "30efed56a035b2549fcaeec0bf2c1595f9a9b3bb4b1a38abaf8ee9041c4b7d93",
        "sig": "f2cb581a84ed10e4dc84937bd98e27acac71ab057255f6aa8dfa561808c981fe8870f4a03c1e3666784d82a9c802d3704e174371aa13d63e2aeaf24ff5374d9d"
        }
    */
    sendZapRequest(callback: string, zapRequest: Event, amount: string, lnurl: string): Observable<LightningInvoice> {
        const event: string = encodeURI(JSON.stringify((zapRequest)));
        const url = `${callback}?amount=${amount}&nostr=${event}&lnurl=${lnurl}`
        return this.http.get<LightningInvoice>(url);
    }

    async login(): Promise<boolean> {
        if (window.webln && !window.webln.isEnabled()) {
            await window.webln.enable();
        }
        return true;
    }

    hasWebln() {
        if (window.webln) {
            return true;
        }
        return false;
    }

    async sendPayment(pr: string) {
        return await window.webln?.sendPayment(pr)
    }

    async payInvoice(pr: string) {
        await this.login();
        if (this.hasWebln()) {
          const rsp = await this.sendPayment(pr).catch((error) => {
            return false;
          });
          if (rsp) {
            return true;
          }
          return false;
        } else {
            console.log("WebLN not available");
            return false;
        }
    }
}
