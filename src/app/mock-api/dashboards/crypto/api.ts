import { Injectable } from '@angular/core';
import { AngorMockApiService } from '@angor/lib/mock-api';
import { crypto as cryptoData } from 'app/mock-api/dashboards/crypto/data';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class CryptoMockApi {
    private _crypto: any = cryptoData;

    /**
     * Constructor
     */
    constructor(private _angorMockApiService: AngorMockApiService) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Crypto - GET
        // -----------------------------------------------------------------------------------------------------
        this._angorMockApiService
            .onGet('api/dashboards/crypto')
            .reply(() => [200, cloneDeep(this._crypto)]);
    }
}
