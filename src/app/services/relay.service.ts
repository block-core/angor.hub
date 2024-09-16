import { Injectable } from "@angular/core";
import { Filter, NostrEvent, SimplePool } from "nostr-tools";
import { Observable, Subject, throttleTime } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class RelayService {
    private pool: SimplePool;
    private relays: { url: string, connected: boolean, retries: number, retryTimeout: any, ws?: WebSocket }[] = [];
    private maxRetries = 10;
    private retryDelay = 15000;
    private eventSubject = new Subject<NostrEvent>();
    private requestQueue: Set<string> = new Set();
    private isProcessingQueue = false;
    private maxConcurrentRequests = 2;

    constructor() {
        this.pool = new SimplePool();
        this.relays = this.loadRelaysFromLocalStorage();
        this.connectToRelays();
        this.setupVisibilityChangeHandling();
    }

    private loadRelaysFromLocalStorage() {
        const defaultRelays = [
            { url: 'wss://relay.angor.io', connected: false, retries: 0, retryTimeout: null, ws: undefined },
            { url: 'wss://relay2.angor.io', connected: false, retries: 0, retryTimeout: null, ws: undefined },
        ];

        const storedRelays = JSON.parse(localStorage.getItem('nostrRelays') || '[]').map((relay: any) => ({
            ...relay,
            connected: false,
            retries: 0,
            retryTimeout: null,
            ws: undefined,
        }));
        return [...defaultRelays, ...storedRelays];
    }

    private connectToRelay(relay: { url: string, connected: boolean, retries: number, retryTimeout: any, ws?: WebSocket }) {
        if (relay.connected) {
            return;
        }

        relay.ws = new WebSocket(relay.url);

        relay.ws.onopen = () => {
            try {
                relay.connected = true;
                relay.retries = 0;
                clearTimeout(relay.retryTimeout);
                this.saveRelaysToLocalStorage();
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        relay.ws.onerror = (error) => {
            try {
                this.handleRelayError(relay);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        relay.ws.onclose = () => {
            try {
                relay.connected = false;
                this.handleRelayError(relay);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
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

    private handleRelayError(relay: { url: string, connected: boolean, retries: number, retryTimeout: any, ws?: WebSocket }) {
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

    public connectToRelays() {
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
                    setTimeout(checkConnection, 1000);
                }
            };
            checkConnection();
        });
    }


    private setupVisibilityChangeHandling() {
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

    public saveRelaysToLocalStorage(): void {
        const customRelays = this.relays.filter(
            (relay) => !['wss://relay.angor.io', 'wss://relay2.angor.io'].includes(relay.url)
        );
        localStorage.setItem('nostrRelays', JSON.stringify(customRelays));
    }

    public getEventStream(): Observable<NostrEvent> {
        return this.eventSubject.asObservable();
    }

    public addRelay(url: string): void {
        if (!this.relays.some(relay => relay.url === url)) {
            const newRelay = { url, connected: false, retries: 0, retryTimeout: null, ws: undefined };
            this.relays.push(newRelay);
            this.connectToRelay(newRelay);
            this.saveRelaysToLocalStorage();
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

    private async processRequestQueue(): Promise<void> {
        if (this.isProcessingQueue) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.size > 0) {
            const batch = Array.from(this.requestQueue).slice(0, this.maxConcurrentRequests);
            this.requestQueue = new Set(Array.from(this.requestQueue).slice(this.maxConcurrentRequests));

            await Promise.all(batch.map(async (filterId) => {
                console.log(`Processing request for filter: ${filterId}`);
            }));

            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }

        this.isProcessingQueue = false;
    }

    public async subscribeToFilter(filter: Filter): Promise<void> {
        try {
            this.requestQueue.add(JSON.stringify(filter));
            this.processRequestQueue();
        } catch (error) {
            console.error('Failed to subscribe to filter:', error);
        }
    }



    public getPool(): SimplePool {
        return this.pool;
    }

    public getRelays(): { url: string, connected: boolean, ws?: WebSocket }[] {
        return this.relays;
    }
}
