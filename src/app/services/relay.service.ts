import { Injectable } from '@angular/core';
import { NostrEvent, SimplePool } from 'nostr-tools';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RelayService {
    private pool: SimplePool;
    private relays: {
        url: string;
        connected: boolean;
        retries: number;
        retryTimeout: any;
        accessType: string;
        ws?: WebSocket;
    }[] = [];
    private maxRetries = 10;
    private retryDelay = 15000;
    private eventSubject = new BehaviorSubject<NostrEvent | null>(null);
    private relaysSubject = new BehaviorSubject<
        {
            url: string;
            connected: boolean;
            accessType: string;
            ws?: WebSocket;
        }[]
    >([]);

    constructor() {
        this.pool = new SimplePool();
        this.relays = this.loadRelaysFromLocalStorage();
        this.connectToRelays();
        this.setupVisibilityChangeHandling();
        this.relaysSubject.next(this.relays);
    }

    private loadRelaysFromLocalStorage(): {
        url: string;
        connected: boolean;
        retries: number;
        retryTimeout: any;
        accessType: string;
        ws?: WebSocket;
    }[] {
        const storedRelays = JSON.parse(
            localStorage.getItem('nostrRelays') || '[]'
        );
        const defaultRelays = [
            {
                url: 'wss://relay.primal.net',
                connected: false,
                retries: 0,
                retryTimeout: null,
                accessType: 'read-write',
                ws: undefined,
            },
            {
                url: 'wss://relay.damus.io',
                connected: false,
                retries: 0,
                retryTimeout: null,
                accessType: 'read-write',
                ws: undefined,
            },
            {
                url: 'wss://relay.angor.io',
                connected: false,
                retries: 0,
                retryTimeout: null,
                accessType: 'read-write',
                ws: undefined,
            },
            {
                url: 'wss://relay2.angor.io',
                connected: false,
                retries: 0,
                retryTimeout: null,
                accessType: 'read-write',
                ws: undefined,
            },
        ];

        return storedRelays.length > 0
            ? storedRelays.map((relay) => ({
                  ...relay,
                  connected: false,
                  retries: 0,
                  retryTimeout: null,
                  ws: undefined,
              }))
            : defaultRelays;
    }

    private saveRelaysToLocalStorage(): void {
        const relaysToSave = this.relays.map((relay) => ({
            url: relay.url,
            accessType: relay.accessType,
            connected: relay.connected,
            retries: relay.retries,
            retryTimeout: relay.retryTimeout,
        }));
        localStorage.setItem('nostrRelays', JSON.stringify(relaysToSave));
        this.relaysSubject.next(this.relays);
    }

    private connectToRelay(relay: {
        url: string;
        connected: boolean;
        retries: number;
        retryTimeout: any;
        accessType: string;
        ws?: WebSocket;
    }): void {
        if (relay.connected) {
            return;
        }

        relay.ws = new WebSocket(relay.url);

        relay.ws.onopen = () => {
            relay.connected = true;
            relay.retries = 0;
            clearTimeout(relay.retryTimeout);
            this.saveRelaysToLocalStorage();
            //console.log(`Connected to relay: ${relay.url}`);
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
                const dataStr =
                    typeof message.data === 'string'
                        ? message.data
                        : message.data.toString('utf-8');
                const parsedData = JSON.parse(dataStr);
                this.eventSubject.next(parsedData);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    }

    private handleRelayError(relay: {
        url: string;
        connected: boolean;
        retries: number;
        retryTimeout: any;
        accessType: string;
        ws?: WebSocket;
    }): void {
        if (relay.retries >= this.maxRetries) {
            console.error(
                `Max retries reached for relay: ${relay.url}. No further attempts will be made.`
            );
            return;
        }

        const retryInterval = this.retryDelay * relay.retries;
        relay.retries++;

        relay.retryTimeout = setTimeout(() => {
            this.connectToRelay(relay);
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
            this.relays.forEach((relay) => {
                if (relay.ws) {
                    relay.ws.close();
                }
            });
        });
    }

    public getConnectedRelays(): string[] {
        return this.relays
            .filter((relay) => relay.connected)
            .map((relay) => relay.url);
    }

    public getRelays(): Observable<
        {
            url: string;
            connected: boolean;
            accessType: string;
            ws?: WebSocket;
        }[]
    > {
        return this.relaysSubject.asObservable();
    }

    async publishEventToWriteRelays(event: NostrEvent): Promise<NostrEvent> {
        const pool = this.getPool();

        const connectedRelays = this.getConnectedRelays();
        console.log('Connected relays:', connectedRelays);

        const writeRelays = this.relays.filter(
            (relay) =>
                relay.accessType === 'write' ||
                relay.accessType === 'read-write'
        );
        console.log('Write relays:', writeRelays);

        const allowedRelays = writeRelays
            .map((relay) => relay.url)
            .filter((url) => connectedRelays.includes(url));

        if (allowedRelays.length === 0) {
            throw new Error('No connected write relays available');
        }

        console.log('Allowed relays for publishing:', allowedRelays);

        const publishPromises = allowedRelays.map(async (relayUrl) => {
            try {
                await pool.publish([relayUrl], event);
                this.eventSubject.next(event);
                return event;
            } catch (error) {
                console.error(
                    `Failed to publish event to relay: ${relayUrl}`,
                    error
                );
                throw error;
            }
        });

        try {
            await Promise.any(publishPromises);
            return event;
        } catch (aggregateError) {
            console.error(
                'Failed to publish event: AggregateError',
                aggregateError
            );
            this.handlePublishFailure(aggregateError);
            throw aggregateError;
        }
    }

    async publishEventToRelays(event: NostrEvent): Promise<NostrEvent> {
        const pool = this.getPool();
        const connectedRelays = this.getConnectedRelays();

        if (connectedRelays.length === 0) {
            throw new Error('No connected relays');
        }

        const publishPromises = connectedRelays.map(async (relayUrl) => {
            try {
                await pool.publish([relayUrl], event);
                this.eventSubject.next(event); // Emit the event to subscribers
                return event;
            } catch (error) {
                console.error(
                    `Failed to publish event to relay: ${relayUrl}`,
                    error
                );
                throw error;
            }
        });

        try {
            await Promise.any(publishPromises);
            return event;
        } catch (aggregateError) {
            console.error(
                'Failed to publish event: AggregateError',
                aggregateError
            );
            this.handlePublishFailure(aggregateError);
            throw aggregateError;
        }
    }

    private handlePublishFailure(error: unknown): void {
        if (error instanceof AggregateError) {
            console.error(
                'All relays failed to publish the event. Retrying...'
            );
        } else {
            console.error('An unexpected error occurred:', error);
        }
    }

    public addRelay(url: string, accessType: string = 'read-write'): void {
        if (!this.relays.some((relay) => relay.url === url)) {
            const newRelay = {
                url,
                connected: false,
                retries: 0,
                retryTimeout: null,
                accessType,
                ws: undefined,
            };
            this.relays.push(newRelay);
            this.connectToRelay(newRelay);
            this.saveRelaysToLocalStorage();
        }
    }

    public removeRelay(url: string): void {
        this.relays = this.relays.filter((relay) => relay.url !== url);
        this.saveRelaysToLocalStorage();
    }

    public removeAllCustomRelays(): void {
        const defaultRelays = ['wss://relay.angor.io', 'wss://relay2.angor.io'];
        this.relays = this.relays.filter((relay) =>
            defaultRelays.includes(relay.url)
        );
        this.saveRelaysToLocalStorage();
    }

    public updateRelayAccessType(url: string, accessType: string): void {
        const relay = this.relays.find((relay) => relay.url === url);
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
