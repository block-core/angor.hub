import { Injectable } from '@angular/core';
import localForage from 'localforage';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private metadataSubject = new BehaviorSubject<any>(null);

  constructor() {
    localForage.config({
      driver: localForage.INDEXEDDB,
      name: 'user-database',
      version: 1.0,
      storeName: 'users',
      description: 'Store for user metadata',
    });
  }


  getMetadataStream(): Observable<any> {
    return this.metadataSubject.asObservable();
  }

  async getUserMetadata(pubkey: string): Promise<any | null> {
    try {
      const metadata = await localForage.getItem(pubkey);
      return metadata;
    } catch (error) {
      console.error('Error getting metadata from IndexedDB:', error);
      return null;
    }
  }

  async saveUserMetadata(pubkey: string, metadata: any): Promise<void> {
    try {
      await localForage.setItem(pubkey, metadata);
      console.log('Metadata saved successfully!');
      this.metadataSubject.next({ pubkey, metadata });
    } catch (error) {
      console.error('Error saving metadata to IndexedDB:', error);
    }
  }

  async removeUserMetadata(pubkey: string): Promise<void> {
    try {
      await localForage.removeItem(pubkey);
      console.log(`Metadata for pubkey ${pubkey} removed successfully!`);
      this.metadataSubject.next({ pubkey, metadata: null });
    } catch (error) {
      console.error('Error removing metadata from IndexedDB:', error);
    }
  }

  async clearAllMetadata(): Promise<void> {
    try {
      await localForage.clear();
      console.log('All metadata cleared successfully!');
      this.metadataSubject.next(null);
    } catch (error) {
      console.error('Error clearing all metadata:', error);
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const allKeys = await localForage.keys();
      const users = [];
      for (const key of allKeys) {
        const user = await localForage.getItem(key);
        if (user) {
          users.push(user);
        }
      }
      return users;
    } catch (error) {
      console.error('Error getting all users from IndexedDB:', error);
      return [];
    }
  }
}
