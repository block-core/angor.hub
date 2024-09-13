import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AngorAlertService {
    // Private subjects for managing alert actions
    private readonly _onDismiss = new ReplaySubject<string>(1);
    private readonly _onShow = new ReplaySubject<string>(1);

    /**
     * Observable for dismissed alerts.
     * @returns {Observable<string>} - Stream of dismissed alerts.
     */
    get onDismiss(): Observable<string> {
        return this._onDismiss.asObservable();
    }

    /**
     * Observable for shown alerts.
     * @returns {Observable<string>} - Stream of shown alerts.
     */
    get onShow(): Observable<string> {
        return this._onShow.asObservable();
    }

    /**
     * Dismisses the alert with the specified name.
     * @param {string} name - The name of the alert to dismiss.
     */
    dismiss(name: string): void {
        if (!name) return; // Exit if name is not provided
        this._onDismiss.next(name); // Trigger dismiss action
    }

    /**
     * Shows the alert with the specified name.
     * @param {string} name - The name of the alert to show.
     */
    show(name: string): void {
        if (!name) return; // Exit if name is not provided
        this._onShow.next(name); // Trigger show action
    }
}
