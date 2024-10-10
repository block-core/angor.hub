import { ANGOR_CONFIG } from '@angor/services/config/config.constants';
import { inject, Injectable } from '@angular/core';
import { merge } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AngorConfigService {
    private readonly _defaultConfig = inject(ANGOR_CONFIG);
    private readonly _configSubject = new BehaviorSubject<any>(
        this._defaultConfig
    );

    /**
     * Getter for config as an Observable.
     */
    get config$(): Observable<any> {
        return this._configSubject.asObservable();
    }

    /**
     * Setter for config.
     * Merges the provided value with the current config and emits the new value.
     *
     * @param value - Partial configuration object to merge with the existing config.
     */
    set config(value: any) {
        const updatedConfig = merge({}, this._configSubject.getValue(), value);
        this._configSubject.next(updatedConfig);
    }

    /**
     * Resets the configuration to the default value.
     */
    reset(): void {
        this._configSubject.next(this._defaultConfig);
    }
}
