import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IndexedDBService } from './indexed-db.service';
import { RelayService } from './relay.service';
import { NostrEvent, Filter } from 'nostr-tools';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private metadataSubject = new BehaviorSubject<any>(null);

  constructor(
    private indexedDBService: IndexedDBService,
    private relayService: RelayService
  ) {}


  getMetadataStream(): Observable<any> {
    return this.metadataSubject.asObservable();
  }


  async fetchMetadataWithCache(pubkey: string): Promise<any> {
    let metadata = await this.indexedDBService.getUserMetadata(pubkey);
    if (metadata) {
      this.metadataSubject.next(metadata);
      console.log('Metadata loaded from localForage (IndexedDB)');
      return metadata;
    }
    metadata = await this.fetchMetadataRealtime(pubkey);
    console.log('Metadata fetched from relays');
    if (metadata) {
      await this.indexedDBService.saveUserMetadata(pubkey, metadata);
      console.log('Metadata saved to localForage (IndexedDB)');
    }
    return metadata;
  }



  private subscribeToMetadataUpdates(pubkey: string): void {
    this.relayService.ensureConnectedRelays().then(() => {
      const filter: Filter = {
        authors: [pubkey],
        kinds: [0],
      };

      this.relayService
        .getPool()
        .subscribeMany(this.relayService.getConnectedRelays(), [filter], {
          onevent: async (event: NostrEvent) => {
            if (event.pubkey === pubkey && event.kind === 0) {
              try {
                const updatedMetadata = JSON.parse(event.content);
                this.metadataSubject.next(updatedMetadata);
                await this.indexedDBService.saveUserMetadata(
                  pubkey,
                  updatedMetadata
                );
                console.log('Real-time metadata update saved to localForage (IndexedDB)');
              } catch (error) {
                console.error('Error parsing updated metadata:', error);
              }
            }
          },
          oneose() {
            console.log('Real-time metadata subscription closed.');
          },
        });
    });
  }


  async fetchMetadataRealtime(pubkey: string): Promise<any> {
    await this.relayService.ensureConnectedRelays();
    const pool = this.relayService.getPool();
    const connectedRelays = this.relayService.getConnectedRelays();

    if (connectedRelays.length === 0) {
      throw new Error('No connected relays');
    }

    const initialMetadata = new Promise<any>((resolve, reject) => {
      const sub = pool.subscribeMany(
        connectedRelays,
        [{ authors: [pubkey], kinds: [0] }],
        {
          onevent: (event: NostrEvent) => {
            if (event.pubkey === pubkey && event.kind === 0) {
              try {
                const content = JSON.parse(event.content);
                resolve(content);
                this.metadataSubject.next(content);
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
        }
      );
    });

    this.subscribeToMetadataUpdates(pubkey);
    return initialMetadata;
  }
}
