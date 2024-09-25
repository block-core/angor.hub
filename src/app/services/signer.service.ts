import { Injectable } from '@angular/core';
import { UnsignedEvent, nip19, getPublicKey, nip04, Event, generateSecretKey, finalizeEvent } from 'nostr-tools';
import { Buffer } from 'buffer';
import { privateKeyFromSeedWords } from 'nostr-tools/nip06';
import { SecurityService } from './security.service';
import { hexToBytes } from '@noble/hashes/utils';
import { MatDialog } from '@angular/material/dialog';
import { PasswordDialogComponent } from 'app/shared/password-dialog/password-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class SignerService {

    localStorageSecretKeyName: string = "secretKey";
    localStoragePublicKeyName: string = "publicKey";
    localStorageNpubName: string = "npub";
    localStorageNsecName: string = "nsec";
    private storageKey = 'userPassword';

    constructor(
        private securityService: SecurityService,
        private dialog: MatDialog
    ) { }

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
            const secretKey = await this.getSecretKey(currentPassword);
            if (!secretKey) {
                throw new Error('Incorrect current password.');
            }

            await this.setSecretKey(secretKey, newPassword);

            const nsec = await this.getNsec(currentPassword);
            if (nsec) {
                await this.setNsec(nsec, newPassword);
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



    getUsername(pubkey: string) {
        if (pubkey.startsWith("npub")) {
            pubkey = nip19.decode(pubkey).data.toString();
        }
        return `@${(localStorage.getItem(`${pubkey}`) || nip19.npubEncode(pubkey))}`;
    }

    npub() {
        let pubkey = this.getPublicKey();
        return nip19.npubEncode(pubkey);
    }

    async requestPassword(): Promise<any> {
        const dialogRef = this.dialog.open(PasswordDialogComponent, {
            width: '300px',
            disableClose: true
        });

        return dialogRef.afterClosed().toPromise();
    }

    async nsec(password: string) {
        if (this.usingSecretKey()) {
            let secretKey = await this.getSecretKey(password);
            const secretKeyUint8Array = Uint8Array.from(Buffer.from(secretKey, 'hex'));
            return nip19.nsecEncode(secretKeyUint8Array);
        }
        return "";
    }


    pubkey(npub: string) {
        return nip19.decode(npub).data.toString();
    }

    //public key===============
    setPublicKey(publicKey: string): void {
        const npub = nip19.npubEncode(publicKey);
        window.localStorage.setItem(this.localStoragePublicKeyName, publicKey);
        window.localStorage.setItem(this.localStorageNpubName, npub);
    }

    getPublicKey() {
        return localStorage.getItem(this.localStoragePublicKeyName) || "";
    }

    //npub===============
    setNpub(npub: string) {
        localStorage.setItem(this.localStorageNpubName, npub);
    }

    getNpub(): string {
        return window.localStorage.getItem(this.localStorageNpubName) || '';
    }

    //seckey===============
    async setSecretKey(secretKey: string, password: string) {
        const encryptedSecretKey = await this.securityService.encryptData(secretKey, password);
        localStorage.setItem(this.localStorageSecretKeyName, encryptedSecretKey);
    }

    async getSecretKey(password: string) {
        const encryptedSecretKey = localStorage.getItem(this.localStorageSecretKeyName);
        if (!encryptedSecretKey) {
            return null;
        }
        return await this.securityService.decryptData(encryptedSecretKey, password);
    }

    async getDecryptedSecretKey(): Promise<string | null> {
        try {
            const storedPassword = this.getPassword(); // Ensure this retrieves a valid password
            if (storedPassword) {
                return await this.getSecretKey(storedPassword); // Ensure getSecretKey returns a valid private key
            }

            const result = await this.requestPassword(); // Prompt user for password if not stored
            if (result?.password) {
                const decryptedPrivateKey = await this.getSecretKey(result.password); // Check that the private key is decrypted properly
                if (result.duration !== 0) {
                    this.savePassword(result.password, result.duration);
                }
                return decryptedPrivateKey;
            }

            console.error('Password not provided');
            return null;
        } catch (error) {
            console.error('Error decrypting private key:', error);
            return null;
        }
    }

    //nsec===============
    async setNsec(nsec: string, password: string) {
        const encryptedNsec = await this.securityService.encryptData(nsec, password);
        localStorage.setItem(this.localStorageNsecName, encryptedNsec);
    }

    async getNsec(password: string) {
        const encryptedNsec = localStorage.getItem(this.localStorageNsecName);
        if (!encryptedNsec) {
            return null;
        }
        return await this.securityService.decryptData(encryptedNsec, password);
    }

    setPublicKeyFromExtension(publicKey: string) {
        this.setPublicKey(publicKey);
    }

    handleLoginWithKey(key: string, password: string): boolean {
        let secretKey: string;
        let pubkey: string;
        let nsec: string;
        let npub: string;

        try {
            if (key.startsWith(this.localStorageNsecName)) {
                const decoded = nip19.decode(key);
                if (decoded.type !== this.localStorageNsecName) {
                    throw new Error('Invalid nsec key.');
                }
                const secretKeyUint8Array = decoded.data as Uint8Array;
                secretKey = Buffer.from(secretKeyUint8Array).toString('hex');
            } else if (/^[0-9a-fA-F]{64}$/.test(key)) {
                secretKey = key;
            } else {
                throw new Error('Invalid key format. Must be either nsec or hex.');
            }

            const secretKeyUint8Array = new Uint8Array(Buffer.from(secretKey, 'hex'));
            pubkey = getPublicKey(secretKeyUint8Array);
            npub = nip19.npubEncode(pubkey);
            nsec = nip19.nsecEncode(secretKeyUint8Array);
            this.setSecretKey(secretKey, password);
            this.setNsec(npub, password);
            this.setPublicKey(pubkey);
            this.setNpub(npub);

            return true;
        } catch (e) {
            console.error("Error during key handling: ", e);
            return false;
        }
    }

    handleLoginWithMenemonic(mnemonic: string, passphrase: string = '', password: string): boolean {
        try {
            const accountIndex = 0;
            const secretKey = privateKeyFromSeedWords(mnemonic, passphrase, accountIndex);
            const secretKeyUint8Array = Uint8Array.from(Buffer.from(secretKey, 'hex'));
            const pubkey = getPublicKey(secretKeyUint8Array);
            const npub = nip19.npubEncode(pubkey);
            const nsec = nip19.nsecEncode(secretKeyUint8Array);
            this.setSecretKey(secretKey, password);
            this.setNsec(npub, password);
            this.setPublicKey(pubkey);
            this.setNpub(npub);

            window.localStorage.setItem(this.localStorageNsecName, nsec);
            return true;
        } catch (error) {
            console.error("Error during login with mnemonic:", error);
            return false;
        }
    }

    logout(): void {
        window.localStorage.removeItem(this.localStorageSecretKeyName);
        window.localStorage.removeItem(this.localStoragePublicKeyName);
        window.localStorage.removeItem(this.localStorageNpubName);
        window.localStorage.removeItem(this.localStorageNsecName);
    }

    usingNostrBrowserExtension() {
        if (this.usingSecretKey()) {
            return false;
        }
        const gt = globalThis as any;
        return !!gt.nostr;
    }

    usingSecretKey() {
        return !!localStorage.getItem(this.localStorageSecretKeyName);
    }

    generateAndStoreKeys(password: string): { secretKey: string, pubkey: string, npub: string, nsec: string } | null {
        try {
            const privateKeyUint8Array = generateSecretKey();
            const secretKey = Buffer.from(privateKeyUint8Array).toString('hex');
            const pubkey = getPublicKey(privateKeyUint8Array);
            const npub = nip19.npubEncode(pubkey);
            const nsec = nip19.nsecEncode(privateKeyUint8Array);
            this.setSecretKey(secretKey, password);
            this.setNsec(npub, password);
            this.setPublicKey(pubkey);
            this.setNpub(npub);

            return { secretKey, pubkey, npub, nsec };
        } catch (error) {
            console.error("Error during key generation:", error);
            return null;
        }
    }

    async handleLoginWithExtension(): Promise<boolean> {
        const globalContext = globalThis as unknown as { nostr?: { getPublicKey?: Function } };
        if (!globalContext.nostr) {
            return false;
        }
        try {
            const pubkey = await globalContext.nostr.getPublicKey();
            if (!pubkey) {
                throw new Error("Public key not available from Nostr extension.");
            }

            this.setPublicKeyFromExtension(pubkey);
            return true;
        } catch (error) {
            console.error('Failed to connect to Nostr extension:', error);
            return false;
        }
    }




    async encryptMessage(privateKey: string, recipientPublicKey: string, message: string): Promise<string> {
        console.log(message);
        try {
            const encryptedMessage = await nip04.encrypt(privateKey, recipientPublicKey, message);
            return encryptedMessage;
        } catch (error) {
            console.error('Error encrypting message:', error);
            throw error;
        }
    }

    async encryptMessageWithExtension(content: string, pubKey: string): Promise<string> {
        const gt = globalThis as any;
        const encryptedMessage = await gt.nostr.nip04.encrypt(pubKey, content);
        return encryptedMessage;
    }


    // Messaging (NIP-04)
    async decryptMessageWithExtension(pubkey: string, ciphertext: string): Promise<string> {
        const gt = globalThis as any;
        if (gt.nostr && gt.nostr.nip04?.decrypt) {
            const decryptedContent = await gt.nostr.nip04.decrypt(pubkey, ciphertext)
                .catch((error: any) => {
                    return "*Failed to Decrypted Content*"
                });
            return decryptedContent;
        }
        return "Attempted Nostr Window decryption and failed."
    }
    // NIP-04: Decrypting Direct Messages
    async decryptMessage(privateKey: string, senderPublicKey: string, encryptedMessage: string): Promise<string> {
        try {
            if (!privateKey) {
                throw new Error('Private key is missing or undefined.');
            }
            const decryptedMessage = await nip04.decrypt(privateKey, senderPublicKey, encryptedMessage);
            return decryptedMessage;
        } catch (error) {
            console.error('Error decrypting message:', error);
            throw error; // Re-throw or handle the error
        }
    }




    getUnsignedEvent(kind: number, tags: string[][], content: string) {
        const eventUnsigned: UnsignedEvent = {
            kind: kind,
            pubkey: this.getPublicKey(),
            tags: tags,
            content: content,
            created_at: Math.floor(Date.now() / 1000),
        }
        return eventUnsigned
    }

    getSignedEvent(eventUnsigned: UnsignedEvent, privateKey: string): Event {
        const privateKeyBytes = hexToBytes(privateKey);

        const signedEvent: Event = finalizeEvent(eventUnsigned, privateKeyBytes);

        return signedEvent;
    }




    async signEventWithExtension(unsignedEvent: UnsignedEvent): Promise<Event> {
        const gt = globalThis as any;
        if (gt.nostr) {
            const signedEvent = await gt.nostr.signEvent(unsignedEvent)
            return signedEvent;
        } else {
            throw new Error("Tried to sign event with extension but failed");
        }
    }

    async signDMWithExtension(pubkey: string, content: string): Promise<string> {
        const gt = globalThis as any;
        if (gt.nostr && gt.nostr.nip04?.encrypt) {
            return await gt.nostr.nip04.encrypt(pubkey, content)
        }
        throw new Error("Failed to Sign with extension");
    }

    public async isUsingExtension(): Promise<boolean> {
        const globalContext = globalThis as any;
        if (globalContext.nostr && globalContext.nostr.getPublicKey) {
            try {
                const secretKey = localStorage.getItem(this.localStorageSecretKeyName);
                return !secretKey;

            } catch (error) {
                console.error("Failed to check Nostr extension:", error);
                return false;
            }
        }
        return false;
    }

    public isUsingSecretKey(): boolean {
        const secretKey = localStorage.getItem(this.localStorageSecretKeyName);
        return !!secretKey;
    }
}
