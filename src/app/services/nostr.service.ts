import { Injectable } from '@angular/core';
import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  verifyEvent,
  Event as NostrEvent
} from 'nostr-tools/pure';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import { RelayService } from './relay.service';
import { Filter,kinds } from 'nostr-tools';
import { nip04 } from 'nostr-tools';
import { SecurityService } from './security.service';
import { Observable, of, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { EncryptedDirectMessage } from 'nostr-tools/kinds';
import { mergeMap, bufferTime } from 'rxjs/operators';


interface CustomMessageEvent {
  isSentByUser: boolean;
  decryptedMessage: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class NostrService {
  private secretKey: Uint8Array;
  private publicKey: string;
  private eventSubject = new Subject<NostrEvent>();
  private notificationSubject = new Subject<NostrEvent>();
  private messageSubject = new Subject<CustomMessageEvent>();
  private currentPage = 0;
  private messagesPerPage = 50;
  private allDecryptedMessages: CustomMessageEvent[] = [];
  private isProcessing = false;

  private isDecrypting = false;
  private messageQueue: NostrEvent[] = [];

  private latestMessageTimestamps: { [pubKey: string]: number } = {};
  private processedEventIds = new Set<string>();
  private chatList: {
    pubKey: string;
    lastMessage: string;
    lastMessageTime: number;
    metadata?: any;
  }[] = [];

  private chatListSubject = new BehaviorSubject<{
    pubKey: string;
    lastMessage: string;
    lastMessageTime: number;
    metadata?: any;
  }[]>(this.chatList);
  nostrPublicKey = '';
  nostrSignedEvent = '';
  nostrRelays?: string[];

  nostrEvent = {
    created_at: Date.now(),
    kind: 1,
    tags: [],
    content: 'This is my nostr message',
    pubkey: '',
  };

  // Observable that other parts of the app can subscribe to
  public eventUpdates$ = this.eventSubject.asObservable();

  constructor(
    private relayService: RelayService,
    private security: SecurityService,
  ) {
    this.secretKey = generateSecretKey();
    this.publicKey = getPublicKey(this.secretKey);
  }


  // Account management
  generateNewAccount(): { publicKey: string; secretKeyHex: string } {
    this.secretKey = generateSecretKey();
    this.publicKey = getPublicKey(this.secretKey);
    return {
      publicKey: this.publicKey,
      secretKeyHex: bytesToHex(this.secretKey),
    };
  }

  getKeys(): { secretKey: Uint8Array; publicKey: string } {
    return {

      secretKey: this.secretKey,
      publicKey: this.publicKey,
    };
  }

  getSecretKeyHex(): string {
    return bytesToHex(this.secretKey);
  }

  getPublicKeyHex(): string {
    return this.publicKey;
  }

  getUserPublicKey(): string | null {
    return localStorage.getItem('nostrPublicKey');
  }

  // Signing events
  async signEventWithPassword(
    content: string,
    encryptedPrivateKey: string,
    password: string,
    kind: number,
    tags: string[][],
    pubkey: string
  ): Promise<NostrEvent> {
    const decryptedPrivateKey = await this.security.decryptData(encryptedPrivateKey, password);
    const secretKey = hexToBytes(decryptedPrivateKey);

    if (!this.isValidHex(bytesToHex(secretKey))) {
      console.error('Invalid secret key provided:', bytesToHex(secretKey));
      throw new Error('Invalid secret key format');
    }

    const event = this.createEvent(content, kind, tags, pubkey);

    const signedEvent = finalizeEvent(event, secretKey);

    if (!this.isValidHex(signedEvent.id)) {
      console.error('Invalid signed event ID:', signedEvent.id);
      throw new Error('Invalid signed event format');
    }

    return signedEvent;
  }


  async signEventWithExtension(content: string, kind: number, tags: string[][], pubkey: string): Promise<NostrEvent> {
    const gt = globalThis as any;

    if (!gt.nostr || typeof gt.nostr.signEvent !== 'function') {
      throw new Error('Nostr extension not available or signEvent method is missing.');
    }

    const event = this.createEvent(content, kind, tags, pubkey);

    try {
      const signedEvent = await gt.nostr.signEvent(event);
      return signedEvent;
    } catch (error) {
      console.error('Error signing event with extension:', error);
      throw error;
    }
  }


  async signEvent(
    eventContent: string,
    kind: number,
    options: {
      encryptedPrivateKey?: string;
      password?: string;
      useExtension?: boolean;
      tags: string[][];
      pubkey: string;
    }
  ): Promise<NostrEvent> {
    const { encryptedPrivateKey, password, useExtension, tags, pubkey } = options;

    if (useExtension) {
      return this.signEventWithExtension(eventContent, kind, tags, pubkey);
    }

    if (encryptedPrivateKey && password) {
      return this.signEventWithPassword(eventContent, encryptedPrivateKey, password, kind, tags, pubkey);
    }

    throw new Error('No valid signing method provided.');
  }

  // Event management
  private createEvent(content: string, kind: number, tags: string[][], pubkey: string): NostrEvent {
    return {
      kind,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content,
      pubkey,
      id: '',
      sig: '',
    } as unknown as NostrEvent;
  }


  async getEventId(event: NostrEvent): Promise<string> {
    const eventSerialized = JSON.stringify([
      0,
      event.pubkey,
      event.created_at,
      event.kind,
      event.tags,
      event.content,
    ]);
    return bytesToHex(await sha256(eventSerialized));
  }

  serializeEvent(event: any): string {
    return JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content]);
  }

  getEventHash(event: any): string {
    const utf8Encoder = new TextEncoder();
    const eventHash = sha256(utf8Encoder.encode(this.serializeEvent(event)));
    return this.bytesToHex(eventHash);
  }

  verifyEvent(event: NostrEvent): boolean {
    return verifyEvent(event);
  }



  // Messaging (NIP-04)
  async decryptMessageWithExtension(encryptedContent: string, senderPubKey: string): Promise<string> {
    try {
      const gt = globalThis as any;
      const decryptedMessage = await gt.nostr.nip04.decrypt(senderPubKey, encryptedContent);
      return decryptedMessage;
    } catch (error) {
      console.error('Error decrypting message with extension:', error);
      throw new Error('Failed to decrypt message with Nostr extension.');
    }
  }


  async encryptMessageWithExtension(content: string, pubKey: string): Promise<string> {
    const gt = globalThis as any;
    const encryptedMessage = await gt.nostr.nip04.encrypt(pubKey, content);
    return encryptedMessage;
  }

  async encryptMessage(privateKey: string, recipientPublicKey: string, message: string): Promise<string> {
    console.log(message);
    try {
      const encryptedMessage = await nip04.encrypt(privateKey, recipientPublicKey, message);
      return encryptedMessage;
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw error;
    }
  }

  // NIP-04: Decrypting Direct Messages
  async decryptMessage(privateKey: string, senderPublicKey: string, encryptedMessage: string): Promise<string> {
    try {
      const decryptedMessage = await nip04.decrypt(privateKey, senderPublicKey, encryptedMessage);
      return decryptedMessage;
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }


  // Profile management
  async updateProfile(
    name: string | null,
    about: string | null,
    picture: string | null,
    tags: string[][] = [],
    pubkey: string | null = null
  ): Promise<NostrEvent> {
    const content = JSON.stringify({ name, about, picture });

    const finalPubkey = pubkey || this.getPublicKeyHex();

    const event = this.createEvent(content, 0, tags, finalPubkey);

    return this.publishEventToRelays(event);
  }


  async getUserProfile(pubkey: string): Promise<any> {
    const metadata = await this.fetchMetadata(pubkey);
    const user: any = {
      nostrPubKey: pubkey,
      displayName: metadata.name,
      picture: metadata.picture,
      about: metadata.about,
      website: metadata.website,
      lud16: metadata.lud16,
      nip05: metadata.nip05,
    };
    return user;
  }

  async fetchMetadata(pubkey: string): Promise<any> {
    await this.ensureRelaysConnected();
    const pool = this.relayService.getPool();
    const connectedRelays = this.relayService.getConnectedRelays();

    if (connectedRelays.length === 0) {
      throw new Error('No connected relays');
    }

    return new Promise((resolve, reject) => {
      const sub = pool.subscribeMany(
        connectedRelays,
        [{ authors: [pubkey], kinds: [0] }],
        {
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
        }
      );
    });
  }

  // Social interactions
  async getFollowers(pubkey: string): Promise<any[]> {
    await this.ensureRelaysConnected();
    const pool = this.relayService.getPool();
    const connectedRelays = this.relayService.getConnectedRelays();

    if (connectedRelays.length === 0) {
      throw new Error('No connected relays');
    }

    const filters: Filter[] = [{ kinds: [3], '#p': [pubkey] }];
    const followers: any[] = [];

    return new Promise((resolve) => {
      const sub = pool.subscribeMany(connectedRelays, filters, {
        onevent: (event: NostrEvent) => {
          followers.push({ nostrPubKey: event.pubkey });
          this.eventSubject.next(event); // Emit the event to subscribers
        },
        oneose() {
          sub.close();
          resolve(followers);
        },
      });
    });
  }

  async getFollowing(pubkey: string): Promise<any[]> {
    await this.ensureRelaysConnected();
    const pool = this.relayService.getPool();
    const connectedRelays = this.relayService.getConnectedRelays();

    if (connectedRelays.length === 0) {
      throw new Error('No connected relays');
    }

    const filters: Filter[] = [{ kinds: [3], authors: [pubkey] }];
    const following: any[] = [];

    return new Promise((resolve) => {
      const sub = pool.subscribeMany(connectedRelays, filters, {
        onevent: (event: NostrEvent) => {
          const tags = event.tags.filter((tag) => tag[0] === 'p');
          tags.forEach((tag) => {
            following.push({ nostrPubKey: tag[1] });
            this.eventSubject.next(event); // Emit the event to subscribers
          });
        },
        oneose() {
          sub.close();
          resolve(following);
        },
      });
    });
  }



  async getEventsByAuthor(
    pubkey: string,
    kinds: number[] = [1]
  ): Promise<NostrEvent[]> {
    await this.ensureRelaysConnected();
    const pool = this.relayService.getPool();
    const connectedRelays = this.relayService.getConnectedRelays();

    if (connectedRelays.length === 0) {
      throw new Error('No connected relays');
    }

    const filters: Filter[] = [{ authors: [pubkey], kinds }];

    return new Promise((resolve) => {
      const events: NostrEvent[] = [];
      const sub = pool.subscribeMany(connectedRelays, filters, {
        onevent: (event: NostrEvent) => {
          events.push(event);
          this.eventSubject.next(event); // Emit the event to subscribers
        },
        oneose() {
          sub.close();
          resolve(events);
        },
      });
    });
  }

  // Relay management
  private async ensureRelaysConnected(): Promise<void> {
    await this.relayService.ensureConnectedRelays();
  }

  async publishEventToRelays(event: NostrEvent): Promise<NostrEvent> {
    await this.ensureRelaysConnected();
    const pool = this.relayService.getPool();
    const connectedRelays = this.relayService.getConnectedRelays();

    if (connectedRelays.length === 0) {
      throw new Error('No connected relays');
    }

    const publishPromises = connectedRelays.map(async (relayUrl) => {
      try {
        await pool.publish([relayUrl], event);
        console.log(`Event published to relay: ${relayUrl}`);
        this.eventSubject.next(event); // Emit the event to subscribers
        return event;
      } catch (error) {
        console.error(`Failed to publish event to relay: ${relayUrl}`, error);
        throw error;
      }
    });

    try {
      await Promise.any(publishPromises);
      return event;
    } catch (aggregateError) {
      console.error('Failed to publish event: AggregateError', aggregateError);
      this.handlePublishFailure(aggregateError);
      throw aggregateError;
    }
  }

  private handlePublishFailure(error: unknown): void {
    if (error instanceof AggregateError) {
      console.error('All relays failed to publish the event. Retrying...');
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }


  //events ================================================================

subscribeToEvents(pubkey: string): void {
    this.relayService.ensureConnectedRelays().then(() => {
      const filter: Filter = {
        kinds: [1], // Kind 1 represents text notes
        authors: [pubkey],
        limit: 20
      };

      this.relayService.subscribeToFilter(filter);

      // Sort and process events using RxJS operators
      this.relayService.getEventStream()
        .pipe(
          bufferTime(1000), // Collect events over 1 second intervals
          mergeMap(events => this.processAndSortEvents(events)) // Process and sort events
        )
        .subscribe((sortedEvents: NostrEvent[]) => {
          sortedEvents.forEach(event => this.eventSubject.next(event));
        });
    });
  }

  // Generic method to process and sort events by `created_at`
  private processAndSortEvents(events: NostrEvent[]): Observable<NostrEvent[]> {
    const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
    return of(sortedEvents);
  }


  //notification================================================================

  subscribeToNotifications(pubkey: string): void {
    this.relayService.ensureConnectedRelays().then(() => {
      // Define a filter for notifications
      const filter: Filter = {
        kinds: [1, 4], // Kind 1 for text notes, kind 4 for encrypted direct messages
        '#p': [pubkey], // Events tagged with the user's public key
        limit: 50
      };

      this.relayService.subscribeToFilter(filter);

      this.relayService.getEventStream().subscribe((event) => {
        if (this.isNotificationEvent(event, pubkey)) {
          // Get the UNIX timestamp from event and convert it to readable date
          const eventTimestamp = event.created_at * 1000; // Convert seconds to milliseconds
          const eventDate = new Date(eventTimestamp);

          // Format the date and time (example: 2024-09-07 14:30)
          const formattedDate = eventDate.toLocaleString();

          // Add message based on the kind of the event
          if (event.kind === 4) {
            event.content = `Sent a private message at ${formattedDate}.`;
          } else if (event.kind === 1) {
            event.content = `Mentioned you in an event at ${formattedDate}.`;
          }

          // Push the updated event to the notificationSubject
          this.notificationSubject.next(event);
        }
      });
    });
  }

  // Check if the event is a notification for the user
  private isNotificationEvent(event: NostrEvent, pubkey: string): boolean {
    return event.tags.some(tag => tag[0] === 'p' && tag[1] === pubkey);
  }

  // Get the notification event stream
  getNotificationStream() {
    return this.notificationSubject.asObservable();
  }

  getEventStream() {
    return this.relayService.getEventStream();
  }

  //Nostr Extension Interactions=======================================================
  async getNostrPublicKeyFromExtension() {
    const gt = globalThis as any;
    const pubKey = await gt.nostr.getPublicKey();
    this.nostrPublicKey = pubKey;
    this.nostrEvent.pubkey = this.nostrPublicKey;
  }

  async getNostrPublicRelaysFromExtension() {
    const gt = globalThis as any;
    const relays = await gt.nostr.getRelays();
    this.nostrRelays = relays;
  }

  // utility methods ================================================================
  isValidHex(hexString: string): boolean {
    return /^[0-9a-fA-F]+$/.test(hexString) && hexString.length % 2 === 0;
  }

  async decryptPrivateKeyWithPassword(encryptedPrivateKey: string, password: string): Promise<string> {
    try {
      const decryptedPrivateKey = await this.security.decryptData(encryptedPrivateKey, password);
      return decryptedPrivateKey;
    } catch (error) {
      console.error('Error decrypting private key with password:', error);
      throw new Error('Failed to decrypt private key with the provided password.');
    }
  }

  bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  //Mwssages============================================================

  subscribeToKind4Messages(
    pubkey: string,
    recipientPublicKey: string,
    useExtension: boolean,
    decryptedSenderPrivateKey: string
  ): void {
    this.currentPage = 0; // Reset to first page
    this.allDecryptedMessages = []; // Reset the list of decrypted messages
    this.processedEventIds.clear(); // Reset the set of processed event IDs
    this.loadMessages(pubkey, recipientPublicKey, useExtension, decryptedSenderPrivateKey, this.currentPage);
    this.subscribeToRealTimeMessages(pubkey, recipientPublicKey, useExtension, decryptedSenderPrivateKey);
  }

  private loadMessages(
    pubkey: string,
    recipientPublicKey: string,
    useExtension: boolean,
    decryptedSenderPrivateKey: string,
    page: number
  ): void {
    this.relayService.ensureConnectedRelays().then(() => {
      const filters: Filter[] = [
        {
          kinds: [4],
          authors: [pubkey],
          '#p': [recipientPublicKey],
          limit: this.messagesPerPage,
          until: this.getPaginationTime(page),
        },
        {
          kinds: [4],
          authors: [recipientPublicKey],
          '#p': [pubkey],
          limit: this.messagesPerPage,
          until: this.getPaginationTime(page),
        },
      ];

      this.relayService.getPool().subscribeMany(this.relayService.getConnectedRelays(), filters, {
        onevent: (event: NostrEvent) => {
          if (!this.processedEventIds.has(event.id) && !this.messageQueue.some(e => e.id === event.id)) {
            this.messageQueue.push(event);
            this.processQueue(pubkey, useExtension, decryptedSenderPrivateKey, recipientPublicKey);
          }
        },
        oneose: () => {
          console.log('Subscription closed');
        },
      });
    });
  }

  private getPaginationTime(page: number): number {
    if (page === 0) {
      return Math.floor(Date.now() / 1000);

    }

    const oldestMessage = this.getOldestMessageTimestamp();
    return oldestMessage ? oldestMessage : Math.floor(Date.now() / 1000);
  }

  loadMoreMessages(pubkey: string, recipientPublicKey: string, useExtension: boolean, decryptedSenderPrivateKey: string): void {
    this.currentPage++;
    this.loadMessages(pubkey, recipientPublicKey, useExtension, decryptedSenderPrivateKey, this.currentPage);
  }

  private subscribeToRealTimeMessages(
    pubkey: string,
    recipientPublicKey: string,
    useExtension: boolean,
    decryptedSenderPrivateKey: string
  ): void {
    this.relayService.ensureConnectedRelays().then(() => {
      const filters: Filter[] = [
        {
          kinds: [4],
          authors: [pubkey],
          '#p': [recipientPublicKey],
        },
        {
          kinds: [4],
          authors: [recipientPublicKey],
          '#p': [pubkey],
        },
      ];

      this.relayService.getPool().subscribeMany(this.relayService.getConnectedRelays(), filters, {
        onevent: (event: NostrEvent) => {
          if (!this.processedEventIds.has(event.id) && !this.messageQueue.some(e => e.id === event.id)) {
            this.messageQueue.push(event);
            this.processQueue(pubkey, useExtension, decryptedSenderPrivateKey, recipientPublicKey);
          }
        },
        oneose: () => {
          console.log('Real-time subscription closed');
        },
      });
    });
  }

  private async processQueue(
    pubkey: string,
    useExtension: boolean,
    decryptedSenderPrivateKey: string,
    recipientPublicKey: string
  ): Promise<void> {
    if (this.isProcessing) {
      console.log('Processing is already in progress, waiting for the current batch to finish...');
      return;
    }

    this.isProcessing = true;

    try {
      while (this.messageQueue.length > 0) {
        const event = this.messageQueue.shift();
        if (event && !this.processedEventIds.has(event.id)) {
          console.log(`Processing event with ID: ${event.id}`);

          try {
            const decryptedMessage = await this.decryptReceivedMessage(
              event,
              useExtension,
              decryptedSenderPrivateKey,
              recipientPublicKey
            );

            if (decryptedMessage) {
              const messageTimestamp = event.created_at * 1000;
              const customMessage: CustomMessageEvent = {
                isSentByUser: event.pubkey === pubkey,
                decryptedMessage,
                createdAt: messageTimestamp,
              };

              this.allDecryptedMessages.push(customMessage);
              this.allDecryptedMessages.sort((a, b) => a.createdAt - b.createdAt);
              this.messageSubject.next(customMessage);
              this.processedEventIds.add(event.id);

            } else {
              console.warn(`Decrypted message is empty for event ID: ${event.id}`);
            }
          } catch (decryptError) {
            console.error(`Failed to decrypt event with ID: ${event.id}`, decryptError);
          }
        } else {
          console.log(`Event with ID: ${event?.id} has already been processed or is invalid.`);
        }
      }
    } catch (queueError) {
      console.error('An error occurred while processing the message queue:', queueError);
    } finally {
      this.isProcessing = false;
      console.log('Finished processing the message queue.');
    }

    if (this.messageQueue.length > 0) {
      console.log('Re-triggering processQueue as there are more messages in the queue...');
      this.processQueue(pubkey, useExtension, decryptedSenderPrivateKey, recipientPublicKey);
    }
  }



  private async decryptReceivedMessage(
    event: NostrEvent,
    useExtension: boolean,
    decryptedSenderPrivateKey: string,
    recipientPublicKey: string
  ): Promise<string> {
    if (useExtension) {
      return await this.decryptMessageWithExtension(event.content, recipientPublicKey);
    } else {
      return await this.decryptMessage(decryptedSenderPrivateKey, recipientPublicKey, event.content);
    }
  }

  private getOldestMessageTimestamp(): number | null {
    if (this.allDecryptedMessages.length === 0) {
      return null;
    }

    return this.allDecryptedMessages.reduce((oldest, message) => {
      return message.createdAt < oldest ? message.createdAt : oldest;
    }, this.allDecryptedMessages[0].createdAt);
  }

  getMessageStream(): Observable<CustomMessageEvent> {
    return this.messageSubject.asObservable();
  }


  //Chat list============================================================

  subscribeToChatList(
    pubkey: string,
    useExtension: boolean,
    decryptedSenderPrivateKey: string
  ): void {
    this.relayService.ensureConnectedRelays().then(() => {
      const filters: Filter[] = [
        {
          kinds: [EncryptedDirectMessage],
          authors: [pubkey],
        },
        {
          kinds: [EncryptedDirectMessage],
          '#p': [pubkey]
        }
      ];

      this.relayService.getPool().subscribeMany(this.relayService.getConnectedRelays(), filters, {
        onevent: async (event: NostrEvent) => {
          const otherPartyPubKey = event.pubkey === pubkey
            ? event.tags.find(tag => tag[0] === 'p')?.[1] || ''
            : event.pubkey;

          if (!otherPartyPubKey) {
            return;
          }

          const lastTimestamp = this.latestMessageTimestamps[otherPartyPubKey] || 0;

          if (event.created_at > lastTimestamp) {
            this.latestMessageTimestamps[otherPartyPubKey] = event.created_at;
            this.messageQueue.push(event);
            this.processNextMessage(pubkey, useExtension, decryptedSenderPrivateKey);
          }
        },
        oneose: () => {
          console.log('Subscription closed');
          this.chatListSubject.next(this.chatList);
        }
      });
    });
  }

  private async processNextMessage(pubkey: string, useExtension: boolean, decryptedSenderPrivateKey: string): Promise<void> {
    if (this.isDecrypting || this.messageQueue.length === 0) {
      return;
    }

    this.isDecrypting = true;
    const event = this.messageQueue.shift();

    if (!event) {
      this.isDecrypting = false;
      return;
    }

    const isSentByUser = event.pubkey === pubkey;
    const otherPartyPubKey = isSentByUser
      ? event.tags.find(tag => tag[0] === 'p')?.[1] || ''
      : event.pubkey;

    if (!otherPartyPubKey) {
      this.isDecrypting = false;
      return;
    }

    try {
      const decryptedMessage = await this.decryptReceivedMessage(
        event,
        useExtension,
        decryptedSenderPrivateKey,
        otherPartyPubKey
      );

      if (decryptedMessage) {
        const messageTimestamp = event.created_at * 1000;
        this.addOrUpdateChatList(otherPartyPubKey, decryptedMessage, messageTimestamp);
      }
    } catch (error) {
      console.error('Failed to decrypt message:', error);
    } finally {
      this.isDecrypting = false;
      this.processNextMessage(pubkey, useExtension, decryptedSenderPrivateKey);
    }
  }

  private addOrUpdateChatList(pubKey: string, message: string, createdAt: number): void {
    const existingItem = this.chatList.find(item => item.pubKey === pubKey);

    if (existingItem) {
      if (existingItem.lastMessageTime < createdAt) {
        existingItem.lastMessage = message;
        existingItem.lastMessageTime = createdAt;
      }
    } else {
      this.chatList.push({ pubKey, lastMessage: message, lastMessageTime: createdAt });
      this.fetchMetadataForPubKey(pubKey);
    }

    this.chatList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  }

  private fetchMetadataForPubKey(pubKey: string): void {
    this.fetchMetadata(pubKey).then(metadata => {
      const existingItem = this.chatList.find(item => item.pubKey === pubKey);
      if (existingItem && metadata) {
        existingItem.metadata = metadata;
        this.chatListSubject.next(this.chatList);
      }
    }).catch(error => {
      console.error(`Failed to fetch metadata for pubKey: ${pubKey}`, error);
    });
  }


  getChatListStream() {
    return this.chatListSubject.asObservable();
  }
}
