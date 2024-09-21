import { Injectable } from '@angular/core';
import { UnsignedEvent, nip19, getPublicKey, nip04, Event, generateSecretKey, finalizeEvent } from 'nostr-tools';
import { Buffer } from 'buffer';
import { privateKeyFromSeedWords } from 'nostr-tools/nip06';
import { SecurityService } from './security.service';
import { hexToBytes } from '@noble/hashes/utils';

@Injectable({
    providedIn: 'root'
})
export class SignerService {

    localStorageSecretKeyName: string = "secretKey";
    localStoragePublicKeyName: string = "publicKey";
    localStorageNpubName: string = "npub";
    localStorageNsecName: string = "nsec";

    constructor(private securityService: SecurityService) { }

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



    // Messaging (NIP-04)
    async decryptMessageWithExtension(encryptedContent: string, senderPubKey: string): Promise<string> {
        try {
            const gt = globalThis as any;
            const decryptedMessage = await gt.nostr.nip04.decrypt(senderPubKey, encryptedContent);
            return decryptedMessage;
        } catch (error) {
            console.error('Error decrypting message with extension:', error);
            throw new Error('Failed to decrypt message with Nostr extension.');
        }
    }


    async encryptMessageWithExtension(content: string, pubKey: string): Promise<string> {
        const gt = globalThis as any;
        const encryptedMessage = await gt.nostr.nip04.encrypt(pubKey, content);
        return encryptedMessage;
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

    // NIP-04: Decrypting Direct Messages
    async decryptMessage(privateKey: string, senderPublicKey: string, encryptedMessage: string): Promise<string> {
        try {
            const decryptedMessage = await nip04.decrypt(privateKey, senderPublicKey, encryptedMessage);
            return decryptedMessage;
        } catch (error) {
            console.error('Error decrypting message:', error);
            throw error;
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

    async decryptDMWithExtension(pubkey: string, ciphertext: string): Promise<string> {
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

    async decryptWithPrivateKey(pubkey: string, ciphertext: string, password: string): Promise<string> {
        try {
            // Get the stored private key in hex format
            let privateKey = await this.getSecretKey("password");

            // Ensure the private key is in Uint8Array format
            const privateKeyUint8Array = new Uint8Array(Buffer.from(privateKey, 'hex'));

            // Decrypt the message using the private key and public key
            return await nip04.decrypt(privateKeyUint8Array, pubkey, ciphertext);
        } catch (error) {
            console.error("Error during decryption: ", error);
            return "*Failed to Decrypted Content*";
        }
    }


    public async isUsingExtension(): Promise<boolean> {
        const globalContext = globalThis as any;
        if (globalContext.nostr && globalContext.nostr.getPublicKey) {
            try {
                const pubkey = await globalContext.nostr.getPublicKey();
                return !!pubkey;
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
