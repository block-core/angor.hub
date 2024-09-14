import { Injectable } from '@angular/core';
import { UnsignedEvent, nip19, getPublicKey, nip04, Event } from 'nostr-tools';
import { Buffer } from 'buffer';


@Injectable({
  providedIn: 'root'
})
export class SignerService {

    localStorageSecretKeyName: string = "secretKey";
    localStoragePublicKeyName: string = "publicKey";

    constructor() { }

    clearKeys() {
        localStorage.removeItem("nostrWalletConnectURI");
        localStorage.removeItem("muteList");
        localStorage.removeItem("currentChip");
        localStorage.removeItem("following");
        localStorage.removeItem(`${this.getPublicKey()}_img`);
        localStorage.removeItem(this.localStorageSecretKeyName);
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
      if (this.usingSecretKey()) {
          let secretKey = this.getSecretKey();
          const secretKeyUint8Array = Uint8Array.from(Buffer.from(secretKey, 'hex'));
          return nip19.nsecEncode(secretKeyUint8Array);
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

    getSecretKey() {
        return localStorage.getItem(this.localStorageSecretKeyName) || "";
    }

    getLoggedInUserImage() {
        // gets from local storage if we have it
        return localStorage.getItem(`${this.getPublicKey()}_img`) || "";
    }

    setLoggedInUserImage(url: string) {
        // sets user image link in local storage
        return localStorage.setItem(`${this.getPublicKey()}_img`, url);
    }

    usingSecretKey() {
        if (localStorage.getItem(this.localStorageSecretKeyName)) {
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
                "wss://relay.angor.io/",
                "wss://relay2.angor.io/"
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

    saveSecretKeyToSession(secretKey: string) {
        localStorage.setItem(this.localStorageSecretKeyName, secretKey);
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
      let secretKey: string;
      try {
          secretKey = nip19.decode(nsec).data as string;

          const secretKeyUint8Array = new Uint8Array(Buffer.from(secretKey, 'hex'));

          let pubkey = getPublicKey(secretKeyUint8Array);

          this.saveSecretKeyToSession(secretKey);
          this.savePublicKeyToSession(pubkey);

          console.log("Public Key: ", this.getPublicKey());
          console.log("Private Key: ", this.getSecretKey());

          return true;
      } catch (e) {
          console.error("Error during key handling: ", e);
          return false;
      }
  }



    usingNostrBrowserExtension() {
        if (this.usingSecretKey()) {
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

    async decryptWithSecretKey(pubkey: string, ciphertext: string): Promise<string> {
      try {
          // Get the stored private key in hex format
          let secretKey = this.getSecretKey();

          // Ensure the private key is in Uint8Array format
          const secretKeyUint8Array = new Uint8Array(Buffer.from(secretKey, 'hex'));

          // Decrypt the message using the private key and public key
          return await nip04.decrypt(secretKeyUint8Array, pubkey, ciphertext);
      } catch (error) {
          console.error("Error during decryption: ", error);
          return "*Failed to Decrypted Content*";
      }
  }

}
