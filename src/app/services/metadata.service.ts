import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IndexedDBService } from './indexed-db.service';
import { RelayService } from './relay.service';
import { NostrEvent, Filter } from 'nostr-tools';
import { debounceTime, throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private metadataSubject = new BehaviorSubject<any>(null);
  private requestQueue: Set<string> = new Set();
  private isProcessingQueue = false;
  private maxRequestsPerBatch = 3;
  private requestDelay = 5000;

  constructor(
    private indexedDBService: IndexedDBService,
    private relayService: RelayService
  ) {}

  getMetadataStream(): Observable<any> {
    return this.metadataSubject.asObservable().pipe(throttleTime(2000));
  }

  private enqueueRequest(pubkey: string): void {
    this.requestQueue.add(pubkey);
    this.processQueue();
  }

  async fetchMetadataForMultipleKeys(pubkeys: string[]): Promise<any[]> {
    const filter: Filter = {
      kinds: [0],
      authors: pubkeys,
    };

    try {
      await this.relayService.ensureConnectedRelays();
      const connectedRelays = this.relayService.getConnectedRelays();

      if (connectedRelays.length === 0) {
        console.error('No relays are connected.');
        return [];
      }

      const metadataList: any[] = [];

      const sub = this.relayService.getPool().subscribeMany(connectedRelays, [filter], {
        onevent: async (event: NostrEvent) => {
          if (event.kind === 0) {
            try {
              const metadata = JSON.parse(event.content);
              await this.indexedDBService.saveUserMetadata(event.pubkey, metadata);
              metadataList.push({ pubkey: event.pubkey, metadata });

            } catch (error) {
              console.error('Error parsing metadata:', error);
            }
          }
        },
        oneose: () => {
        }
      });

      setTimeout(() => {
        sub.close();
      }, 1000 );

      return metadataList;
    } catch (error) {
      console.error('Failed to fetch metadata for multiple keys:', error);
      return [];
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.size === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.size > 0) {
      const batch = Array.from(this.requestQueue).slice(0, this.maxRequestsPerBatch);
      this.requestQueue = new Set(Array.from(this.requestQueue).slice(this.maxRequestsPerBatch));

      await Promise.all(batch.map(async (pubkey) => {
        try {
          const updatedMetadata = await this.fetchMetadataRealtime(pubkey);
          if (updatedMetadata) {
            await this.indexedDBService.saveUserMetadata(pubkey, updatedMetadata);
            this.metadataSubject.next(updatedMetadata);
           }
        } catch (error) {
          console.error(`Failed to update metadata for user: ${pubkey}`, error);
        }
      }));

      await new Promise(resolve => setTimeout(resolve, this.requestDelay));
    }

    this.isProcessingQueue = false;
  }

  async fetchMetadataWithCache(pubkey: string): Promise<any> {
    const metadata = await this.indexedDBService.getUserMetadata(pubkey);
    if (metadata) {
      this.metadataSubject.next(metadata);
     } else {
      this.enqueueRequest(pubkey);
    }

    this.subscribeToMetadataUpdates(pubkey);
    return metadata;
  }

  private subscribeToMetadataUpdates(pubkey: string): void {
    this.relayService.ensureConnectedRelays().then(() => {
      const filter: Filter = { authors: [pubkey], kinds: [0] };

      this.relayService.getPool().subscribeMany(this.relayService.getConnectedRelays(), [filter], {
        onevent: async (event: NostrEvent) => {
          if (event.pubkey === pubkey && event.kind === 0) {
            try {
              const updatedMetadata = JSON.parse(event.content);
              await this.indexedDBService.saveUserMetadata(pubkey, updatedMetadata);
              this.metadataSubject.next(updatedMetadata);
             } catch (error) {
              console.error('Error parsing updated metadata:', error);
            }
          }
        },
        oneose(){},
      });
    });
  }

  async fetchMetadataRealtime(pubkey: string): Promise<any> {
    await this.relayService.ensureConnectedRelays();
    const connectedRelays = this.relayService.getConnectedRelays();

    if (connectedRelays.length === 0) {
      throw new Error('No connected relays');
    }

    return new Promise<any>((resolve) => {
      const sub = this.relayService.getPool().subscribeMany(connectedRelays, [{ authors: [pubkey], kinds: [0] }], {
        onevent: (event: NostrEvent) => {
          if (event.pubkey === pubkey && event.kind === 0) {
            try {
              const content = JSON.parse(event.content);
              resolve(content);
            } catch (error) {
              console.error('Error parsing event content:', error);
              resolve(null);
            } finally {
              sub.close();
            }
          }
        },
        oneose() {
          sub.close();
          resolve(null);
        },
      });
    });
  }

  async refreshAllStoredMetadata(): Promise<void> {
    const storedUsers = await this.indexedDBService.getAllUsers();
    if (!storedUsers || storedUsers.length === 0) {
      return;
    }

    storedUsers.forEach(user => this.enqueueRequest(user.pubkey));
  }


  async getUserMetadata(pubkey: string): Promise<any> {
    try {
      const cachedMetadata = await this.indexedDBService.getUserMetadata(pubkey);
      if (cachedMetadata) {
        return cachedMetadata;
      }

      const liveMetadata = await this.fetchMetadataRealtime(pubkey);
      if (liveMetadata) {
        await this.indexedDBService.saveUserMetadata(pubkey, liveMetadata);
        return liveMetadata;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching metadata for user ${pubkey}:`, error);
      return null;
    }
  }

}
