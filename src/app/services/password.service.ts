import { Injectable } from '@angular/core';
import { SignerService } from './signer.service';

@Injectable({
    providedIn: 'root',
})
export class PasswordService {

    private storageKey = 'userPassword';

    constructor(private signerService: SignerService) {}

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

    async changePassword(currentPassword: string, newPassword: string , savePassword:boolean): Promise<boolean> {
        try {
            const secretKey = await this.signerService.getSecretKey(currentPassword);
            if (!secretKey) {
                throw new Error('Incorrect current password.');
            }

            await this.signerService.setSecretKey(secretKey, newPassword);

            const nsec = await this.signerService.getNsec(currentPassword);
            if (nsec) {
                await this.signerService.setNsec(nsec, newPassword);
            }

            this.clearPassword();

            if (savePassword) {
                this.savePassword(newPassword, 60);
            }

            return true;
        } catch (error) {
            console.error("Failed to change password: ", error);
            return false;
        }
    }

}
