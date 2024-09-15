import { Injectable } from '@angular/core';
import localForage from 'localforage';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  constructor() {
    
    localForage.config({
      driver: localForage.INDEXEDDB,
      name: 'user-database',
      version: 1.0,
      storeName: 'users',
      description: 'Store for user metadata',
    });
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
    } catch (error) {
      console.error('Error saving metadata to IndexedDB:', error);
    }
  }


  async removeUserMetadata(pubkey: string): Promise<void> {
    try {
      await localForage.removeItem(pubkey);
      console.log(`Metadata for pubkey ${pubkey} removed successfully!`);
    } catch (error) {
      console.error('Error removing metadata from IndexedDB:', error);
    }
  }


  async clearAllMetadata(): Promise<void> {
    try {
      await localForage.clear();
      console.log('All metadata cleared successfully!');
    } catch (error) {
      console.error('Error clearing all metadata:', error);
    }
  }
}
