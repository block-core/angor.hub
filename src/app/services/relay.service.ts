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
    private eventSubject = new BehaviorSubject<NostrEvent | null>(null); // For publishing events to the UI
    private relaysSubject = new BehaviorSubject<{ url: string, connected: boolean, accessType: string, ws?: WebSocket }[]>([]); // For tracking relay changes

    constructor() {
        this.pool = new SimplePool();
        this.relays = this.loadRelaysFromLocalStorage();
        this.connectToRelays(); // Initiates connection to all relays on service creation
        this.setupVisibilityChangeHandling();
        this.relaysSubject.next(this.relays); // Emit the initial relay state
    }

    /**
     * Load relays from localStorage and return them with their initial state.
     */
    private loadRelaysFromLocalStorage(): { url: string, connected: boolean, retries: number, retryTimeout: any, accessType: string, ws?: WebSocket }[] {
        const storedRelays = JSON.parse(localStorage.getItem('nostrRelays') || '[]');
        const defaultRelays = [
            { url: 'wss://relay.angor.io', connected: false, retries: 0, retryTimeout: null, accessType: 'read-write', ws: undefined },
            { url: 'wss://relay2.angor.io', connected: false, retries: 0, retryTimeout: null, accessType: 'read-write', ws: undefined },
        ];

        return storedRelays.length > 0 ? storedRelays.map(relay => ({
            ...relay,
            connected: false, // The connection will be re-established
            retries: 0,
            retryTimeout: null,
            ws: undefined, // WebSocket will be reinitialized
        })) : defaultRelays;
    }

    /**
     * Save the current relays to localStorage, omitting WebSocket references.
     */
    private saveRelaysToLocalStorage(): void {
        const relaysToSave = this.relays.map(relay => ({
            url: relay.url,
            accessType: relay.accessType,
            connected: relay.connected,
            retries: relay.retries,
            retryTimeout: relay.retryTimeout,
        }));
        localStorage.setItem('nostrRelays', JSON.stringify(relaysToSave));
        this.relaysSubject.next(this.relays); // Notify subscribers of relay changes
    }

    /**
     * Connect to a single relay using WebSocket.
     */
    private connectToRelay(relay: { url: string, connected: boolean, retries: number, retryTimeout: any, accessType: string, ws?: WebSocket }): void {
        if (relay.connected) {
            return; // Already connected
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

    /**
     * Handle errors for a relay connection and attempt reconnection.
     */
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

    /**
     * Connect to all relays in the list.
     */
    public connectToRelays(): void {
        this.relays.forEach((relay) => {
            if (!relay.connected) {
                this.connectToRelay(relay);
            }
        });
    }

    /**
     * Ensure that at least one relay is connected before continuing.
     */
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

    /**
     * Handle browser visibility changes to reconnect relays when the user returns to the page.
     */
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

    /**
     * Return the URLs of all connected relays.
     */
    public getConnectedRelays(): string[] {
        return this.relays.filter((relay) => relay.connected).map((relay) => relay.url);
    }

    /**
     * Return an observable of relay changes for the UI to subscribe to.
     */
    public getRelays(): Observable<{ url: string, connected: boolean, accessType: string, ws?: WebSocket }[]> {
        return this.relaysSubject.asObservable();
    }

    /**
     * Publish an event to all relays with write or read-write access.
     */
    public publishEventToWriteRelays(event: NostrEvent): void {
        const writeRelays = this.relays.filter(relay => relay.accessType === 'write' || relay.accessType === 'read-write');
        writeRelays.forEach((relay) => {
            if (relay.connected && relay.ws?.readyState === WebSocket.OPEN) {
                relay.ws.send(JSON.stringify(event));
                console.log(`Event published to ${relay.url}`);
            }
        });
    }

    /**
     * Add a new relay to the list and attempt to connect to it.
     */
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

    /**
     * Remove a relay from the list by its URL.
     */
    public removeRelay(url: string): void {
        this.relays = this.relays.filter(relay => relay.url !== url);
        this.saveRelaysToLocalStorage();
    }

    /**
     * Remove all custom relays, leaving only the default ones.
     */
    public removeAllCustomRelays(): void {
        const defaultRelays = ['wss://relay.angor.io', 'wss://relay2.angor.io'];
        this.relays = this.relays.filter(relay => defaultRelays.includes(relay.url));
        this.saveRelaysToLocalStorage();
    }

    /**
     * Update the access type of a specific relay.
     */
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
    /**
     * Return the event stream as an observable for other parts of the app to subscribe to.
     */
    public getEventStream(): Observable<NostrEvent | null> {
        return this.eventSubject.asObservable();
    }
}
