import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PasswordService {

    private storageKey = 'userPassword';

    savePassword(password: string, durationInMinutes: number): void {
        const expirationTime = Date.now() + durationInMinutes * 60 * 1000;
        const passwordData = {
            password,
            expirationTime
        };
        sessionStorage.setItem(this.storageKey, JSON.stringify(passwordData));
    }

    getPassword(): string | null {
        const passwordData = sessionStorage.getItem(this.storageKey);
        if (!passwordData) return null;

        const { password, expirationTime } = JSON.parse(passwordData);

        if (Date.now() > expirationTime) {
            this.clearPassword();
            return null;
        }

        return password;
    }

    clearPassword(): void {
        sessionStorage.removeItem(this.storageKey);
    }
}
