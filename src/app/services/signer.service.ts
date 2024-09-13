import { Injectable } from '@angular/core';
import { UnsignedEvent, nip19, getPublicKey, nip04, Event } from 'nostr-tools';


@Injectable({
  providedIn: 'root'
})
export class SignerService {

    localStoragePrivateKeyName: string = "privateKey";
    localStoragePublicKeyName: string = "publicKey";

    constructor() { }

    clearKeys() {
        localStorage.removeItem("nostrWalletConnectURI");
        localStorage.removeItem("muteList");
        localStorage.removeItem("currentChip");
        localStorage.removeItem("following");
        localStorage.removeItem(`${this.getPublicKey()}_img`);
        localStorage.removeItem(this.localStoragePrivateKeyName);
        localStorage.removeItem(this.localStoragePublicKeyName);
        console.log("data cleared")
        console.log(localStorage.getItem("nostrWalletConnect"))
    }

    getUsername(pubkey: string) {
        // can take a pubkey or npub
        if (pubkey.startsWith("npub")) {
            pubkey = nip19.decode(pubkey).data.toString()
        }
        return `@${(localStorage.getItem(`${pubkey}`) || nip19.npubEncode(pubkey))}`
    }

    npub() {
        let pubkey = this.getPublicKey();
        return nip19.npubEncode(pubkey);
    }

    nsec() {
        if (this.usingPrivateKey()) {
            let privateKey = this.getPrivateKey();
            const privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKey, 'hex'));
            return nip19.nsecEncode(privateKeyUint8Array);
        }
        return "";
    }

    pubkey(npub: string) {
        return nip19.decode(npub).data.toString();
    }

    encodeNoteAsEvent(note: string): string {
        let decodedNote = nip19.decode(note).data.toString()
        let eventP: nip19.EventPointer = {id: decodedNote}
        return nip19.neventEncode(eventP);
    }

    getPublicKey() {
        return localStorage.getItem(this.localStoragePublicKeyName) || "";
    }

    getPrivateKey() {
        return localStorage.getItem(this.localStoragePrivateKeyName) || "";
    }

    getLoggedInUserImage() {
        // gets from local storage if we have it
        return localStorage.getItem(`${this.getPublicKey()}_img`) || "";
    }

    setLoggedInUserImage(url: string) {
        // sets user image link in local storage
        return localStorage.setItem(`${this.getPublicKey()}_img`, url);
    }

    usingPrivateKey() {
        if (localStorage.getItem(this.localStoragePrivateKeyName)) {
            return true;
        }
        return false;
    }

    getFollowingList() {
        const followingRaw = localStorage.getItem("following");
        if (followingRaw === null || followingRaw === "") {
            return [];
        }
        let following = (followingRaw).split(',');
        return following.filter(value => /[a-f0-9]{64}/.test(value));
    }

    getMuteList() {
        return (localStorage.getItem("muteList") || "").split(',');
    }

    setMuteListFromTags(tags: string[][]): void {
        let muteList: string[] = []
        tags.forEach(t => {
            muteList.push(t[1]);
        })
        this.setMuteList(muteList);
    }

    setMuteList(muteList: string[]) {
        if (muteList.length === 0) {
            localStorage.setItem("muteList", "");
        } else {
            let muteSet = Array.from(new Set(muteList));
            localStorage.setItem("muteList", muteSet.filter(s => s).join(','));
        }
    }

    getRelay(): string {
        return localStorage.getItem("relay") || "wss://relay.damus.io/";
    }

    getRelays(): string[] {
        const relaysString = localStorage.getItem("relays") || "";
        let relays = relaysString.split(",").map((item) => {
            return item.trim();
        });
        if (relays.length === 0 || relays[0] === "") {
            relays = [
                "wss://relay.damus.io/",
                "wss://nostr.fmt.wiz.biz/",
                "wss://relay.nostr.band/",
                "wss://relay.snort.social/",
                "wss://nostr.mom",
                "wss://relayable.org",
                "wss://purplepag.es",
           ]
        }
        return relays
    }

    setRelay(relay: string): void {
        localStorage.setItem("relay", relay);
    }

    setRelays(relays: string[]): void {
        localStorage.setItem("relays", relays.join(","));
    }

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

    getFollowingListAsTags(): string[][] {
        let following = this.getFollowingList();
        let tags: string[][] = [];
        following.forEach(f => {
            tags.push(["p", f, "wss://relay.damus.io/", localStorage.getItem(`${f}`) || ""]);
        });
        return tags;
    }

    setFollowingListFromTags(tags: string[][]): void {
        let following: string[] = []
        tags.forEach(t => {
            following.push(t[1]);
        })
        this.setFollowingList(following);
    }

    setFollowingList(following: string[]) {
        let followingSet = Array.from(new Set(following));
        let newFollowingList = followingSet.filter(s => s).join(',')
        localStorage.setItem("following", newFollowingList);
    }

    savePublicKeyToSession(publicKey: string) {
        localStorage.setItem(this.localStoragePublicKeyName, publicKey);
    }

    savePrivateKeyToSession(privateKey: string) {
        localStorage.setItem(this.localStoragePrivateKeyName, privateKey);
    }

    setPublicKeyFromExtension(publicKey: string) {
        this.savePublicKeyToSession(publicKey);
    }

    setBlurImagesIfNotFollowing(blur: boolean) {
        if (blur) {
            localStorage.setItem("blur", "true");
        } else {
            localStorage.setItem("blur", "false");
        }
    }

    getBlurImagesIfNotFollowing() {
        const blur = localStorage.getItem("blur") || "true";
        if (blur === "false") {
            return false;
        }
        return true;
    }

    handleLoginWithNsec(nsec: string) {
        let privateKey: string;
        try {
            privateKey = nip19.decode(nsec).data.toString();
        } catch (e) {
            return false;
        }

        // Assuming the private key is stored in hexadecimal format
        const privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKey, 'hex'));
        let pubkey = getPublicKey(privateKeyUint8Array);
        this.savePrivateKeyToSession(privateKey);
        this.savePublicKeyToSession(pubkey);
        console.log(this.getPublicKey())
        console.log(this.getPrivateKey())
        return true;
    }

    usingNostrBrowserExtension() {
        if (this.usingPrivateKey()) {
            return false;
        }
        const gt = globalThis as any;
        if (gt.nostr) {
            return true;
        }
        return false;
    }

    async handleLoginWithExtension(): Promise<boolean> {
        const gt = globalThis as any;
        if (gt.nostr) {
            const pubkey = await gt.nostr.getPublicKey().catch((e) => {
                console.log(e);
                return "";
            });
            if (pubkey === "") {
                return false;
            }
            this.setPublicKeyFromExtension(pubkey);
            return true;
        }
        return false;
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

    async decryptWithPrivateKey(pubkey: string, ciphertext: string): Promise<string> {
        let privateKey = this.getPrivateKey()
        return await nip04.decrypt(privateKey, pubkey, ciphertext).catch((error) => {
            return "*Failed to Decrypted Content*";
        });
    }
}
