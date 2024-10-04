import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WalletService {

    constructor() { }

    getDefaultZap() {
        return localStorage.getItem("defaultZap") || "5";
    }

    setDefaultZap(defaultZap: string) {
        localStorage.setItem("defaultZap", defaultZap)
    }

    setNostrWalletConnectURI(uri: string) {
        localStorage.setItem("nostrWalletConnectURI", uri);
    }

    getNostrWalletConnectURI() {
        const x = localStorage.getItem("nostrWalletConnectURI") || "";
        if (x === "") {
            return null;
        }
        return x;
    }



}
