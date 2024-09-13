import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndexerService {

  private mainnetLocalStorageKey = 'mainnetIndexers';
  private testnetLocalStorageKey = 'testnetIndexers';
  private mainnetPrimaryIndexerKey = 'mainnetPrimaryIndexer';
  private testnetPrimaryIndexerKey = 'testnetPrimaryIndexer';

  private networkStorageKey = 'selectedNetwork';

  private defaultMainnetIndexer = 'https://btc.indexer.angor.io/';
  private defaultTestnetIndexer = 'https://tbtc.indexer.angor.io/';

  constructor() {
    this.initializeDefaultIndexers();
  }

  private initializeDefaultIndexers(): void {
    if (this.getIndexers('mainnet').length === 0) {
      this.addIndexer(this.defaultMainnetIndexer, 'mainnet');
      this.setPrimaryIndexer(this.defaultMainnetIndexer, 'mainnet');
    }
    if (this.getIndexers('testnet').length === 0) {
      this.addIndexer(this.defaultTestnetIndexer, 'testnet');
      this.setPrimaryIndexer(this.defaultTestnetIndexer, 'testnet');
    }
  }

  addIndexer(indexer: string, network: 'mainnet' | 'testnet'): void {
    let indexers = this.getIndexers(network);
    if (!indexers.includes(indexer)) {
      indexers.push(indexer);
      this.saveIndexers(indexers, network);
    }
  }

  getIndexers(network: 'mainnet' | 'testnet'): string[] {
    const storageKey = network === 'mainnet' ? this.mainnetLocalStorageKey : this.testnetLocalStorageKey;
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }

  private saveIndexers(indexers: string[], network: 'mainnet' | 'testnet'): void {
    const storageKey = network === 'mainnet' ? this.mainnetLocalStorageKey : this.testnetLocalStorageKey;
    localStorage.setItem(storageKey, JSON.stringify(indexers));
  }

  setPrimaryIndexer(indexer: string, network: 'mainnet' | 'testnet'): void {
    if (this.getIndexers(network).includes(indexer)) {
      const primaryKey = network === 'mainnet' ? this.mainnetPrimaryIndexerKey : this.testnetPrimaryIndexerKey;
      localStorage.setItem(primaryKey, indexer);
    }
  }

  getPrimaryIndexer(network: 'mainnet' | 'testnet'): string | null {
    const primaryKey = network === 'mainnet' ? this.mainnetPrimaryIndexerKey : this.testnetPrimaryIndexerKey;
    return localStorage.getItem(primaryKey);
  }

  removeIndexer(indexer: string, network: 'mainnet' | 'testnet'): void {
    let indexers = this.getIndexers(network);
    const index = indexers.indexOf(indexer);
    if (index !== -1) {
      indexers.splice(index, 1);
      this.saveIndexers(indexers, network);
      if (indexer === this.getPrimaryIndexer(network)) {
        const primaryKey = network === 'mainnet' ? this.mainnetPrimaryIndexerKey : this.testnetPrimaryIndexerKey;
        localStorage.removeItem(primaryKey);
      }
    }
  }

  clearAllIndexers(network: 'mainnet' | 'testnet'): void {
    const storageKey = network === 'mainnet' ? this.mainnetLocalStorageKey : this.testnetLocalStorageKey;
    const primaryKey = network === 'mainnet' ? this.mainnetPrimaryIndexerKey : this.testnetPrimaryIndexerKey;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(primaryKey);
  }
  setNetwork(network: 'mainnet' | 'testnet'): void {
    localStorage.setItem(this.networkStorageKey, network);
  }

  getNetwork(): 'mainnet' | 'testnet' {
    return (localStorage.getItem(this.networkStorageKey) as 'mainnet' | 'testnet') || 'testnet';
  }
}
