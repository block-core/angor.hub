import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { NostrEvent, SimplePool } from "nostr-tools";

@Injectable({
    providedIn: 'root',
})
export class RelayService {
    private pool: SimplePool;
    private relays: { url: string, connected: boolean, retries: number, retryTimeout: any, accessType: string, ws?: WebSocket }[] = [];
    private maxRetries = 10;
    private retryDelay = 15000;
    private eventSubject = new BehaviorSubject<NostrEvent | null>(null);
    private relaysSubject = new BehaviorSubject<{ url: string, connected: boolean, accessType: string, ws?: WebSocket }[]>([]);

    constructor() {
        this.pool = new SimplePool();
        this.relays = this.loadRelaysFromLocalStorage();
        this.connectToRelays();
        this.setupVisibilityChangeHandling();
        this.relaysSubject.next(this.relays);
    }

    private loadRelaysFromLocalStorage(): { url: string, connected: boolean, retries: number, retryTimeout: any, accessType: string, ws?: WebSocket }[] {
        const storedRelays = JSON.parse(localStorage.getItem('nostrRelays') || '[]');
        const defaultRelays = [
            { url: 'wss://relay.angor.io', connected: false, retries: 0, retryTimeout: null, accessType: 'read-write', ws: undefined },
            { url: 'wss://relay2.angor.io', connected: false, retries: 0, retryTimeout: null, accessType: 'read-write', ws: undefined },
        ];

        return storedRelays.length > 0 ? storedRelays.map(relay => ({
            ...relay,
            connected: false,
            retries: 0,
            retryTimeout: null,
            ws: undefined,
        })) : defaultRelays;
    }

    private saveRelaysToLocalStorage(): void {
        const relaysToSave = this.relays.map(relay => ({
            url: relay.url,
            accessType: relay.accessType,
            connected: relay.connected,
            retries: relay.retries,
            retryTimeout: relay.retryTimeout,
        }));
        localStorage.setItem('nostrRelays', JSON.stringify(relaysToSave));
        this.relaysSubject.next(this.relays);
    }

    private connectToRelay(relay: { url: string, connected: boolean, retries: number, retryTimeout: any, accessType: string, ws?: WebSocket }): void {
        if (relay.connected) {
            return; 
        }

        relay.ws = new WebSocket(relay.url);

        relay.ws.onopen = () => {
            relay.connected = true;
            relay.retries = 0;
            clearTimeout(relay.retryTimeout);
            this.saveRelaysToLocalStorage();
            console.log(`Connected to relay: ${relay.url}`);
        };

        relay.ws.onerror = () => {
            this.handleRelayError(relay);
        };

        relay.ws.onclose = () => {
            relay.connected = false;
            this.handleRelayError(relay);
        };

        relay.ws.onmessage = (message) => {
            try {
                const dataStr = typeof message.data === 'string' ? message.data : message.data.toString('utf-8');
                const parsedData = JSON.parse(dataStr);
                this.eventSubject.next(parsedData);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    }

    private handleRelayError(relay: { url: string, connected: boolean, retries: number, retryTimeout: any, accessType: string, ws?: WebSocket }): void {
        if (relay.retries >= this.maxRetries) {
            console.error(`Max retries reached for relay: ${relay.url}. No further attempts will be made.`);
            return;
        }

        const retryInterval = this.retryDelay * relay.retries;
        relay.retries++;

        relay.retryTimeout = setTimeout(() => {
            this.connectToRelay(relay);
            console.log(`Retrying connection to relay: ${relay.url} (Attempt ${relay.retries})`);
        }, retryInterval);
    }

    public connectToRelays(): void {
        this.relays.forEach((relay) => {
            if (!relay.connected) {
                this.connectToRelay(relay);
            }
        });
    }

    public async ensureConnectedRelays(): Promise<void> {
        this.connectToRelays();

        return new Promise((resolve) => {
            const checkConnection = () => {
                if (this.getConnectedRelays().length > 0) {
                    resolve();
                } else {
                    setTimeout(checkConnection, 1000); // Retry after 1 second
                }
            };
            checkConnection();
        });
    }

    private setupVisibilityChangeHandling(): void {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.connectToRelays();
            }
        });

        window.addEventListener('beforeunload', () => {
            this.relays.forEach(relay => {
                if (relay.ws) {
                    relay.ws.close();
                }
            });
        });
    }

    public getConnectedRelays(): string[] {
        return this.relays.filter((relay) => relay.connected).map((relay) => relay.url);
    }

    public getRelays(): Observable<{ url: string, connected: boolean, accessType: string, ws?: WebSocket }[]> {
        return this.relaysSubject.asObservable();
    }

    public publishEventToWriteRelays(event: NostrEvent): void {
        const writeRelays = this.relays.filter(relay => relay.accessType === 'write' || relay.accessType === 'read-write');
        writeRelays.forEach((relay) => {
            if (relay.connected && relay.ws?.readyState === WebSocket.OPEN) {
                relay.ws.send(JSON.stringify(event));
                console.log(`Event published to ${relay.url}`);
            }
        });
    }

    public addRelay(url: string, accessType: string = 'read-write'): void {
        if (!this.relays.some(relay => relay.url === url)) {
            const newRelay = { url, connected: false, retries: 0, retryTimeout: null, accessType, ws: undefined };
            this.relays.push(newRelay);
            this.connectToRelay(newRelay);
            this.saveRelaysToLocalStorage();
        } else {
            console.log(`Relay with URL ${url} already exists.`);
        }
    }

    public removeRelay(url: string): void {
        this.relays = this.relays.filter(relay => relay.url !== url);
        this.saveRelaysToLocalStorage();
    }

    public removeAllCustomRelays(): void {
        const defaultRelays = ['wss://relay.angor.io', 'wss://relay2.angor.io'];
        this.relays = this.relays.filter(relay => defaultRelays.includes(relay.url));
        this.saveRelaysToLocalStorage();
    }

    public updateRelayAccessType(url: string, accessType: string): void {
        const relay = this.relays.find(relay => relay.url === url);
        if (relay) {
            relay.accessType = accessType;
            this.saveRelaysToLocalStorage();
        }
    }

    public getPool(): SimplePool {
        return this.pool;
    }

    public getEventStream(): Observable<NostrEvent | null> {
        return this.eventSubject.asObservable();
    }
}
