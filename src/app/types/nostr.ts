import { UnsignedEvent, Event } from "nostr-tools"

export interface NostrWindow {
    getPublicKey: () => Promise<string>
    signEvent: (event: UnsignedEvent) => Promise<Event>
    nip04?: {
        encrypt?: (pubkey: string, plaintext: string) => Promise<string>
        decrypt?: (pubkey: string, ciphertext: string) => Promise<string>
    }
}


export interface NIP05Names {
    [key: string]: string;
}

export interface NIP05 {
    names: NIP05Names;
    relays?: {};
}
