import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError, of, Subscriber } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { Chat, Contact, Profile } from 'app/components/chat/chat.types';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { MetadataService } from 'app/services/metadata.service';
import { SignerService } from 'app/services/signer.service';
import { Filter, NostrEvent } from 'nostr-tools';
import { RelayService } from 'app/services/relay.service';
import { EncryptedDirectMessage } from 'nostr-tools/kinds';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
    private chatList: Chat[] = [];
    private latestMessageTimestamps: { [pubKey: string]: number } = {};
    private messageQueue: NostrEvent[] = [];
    private isDecrypting = false;

    private _chat: BehaviorSubject<Chat | null> = new BehaviorSubject(null);
    private _chats: BehaviorSubject<Chat[] | null> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(null);
    private _profile: BehaviorSubject<Profile | null> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _httpClient: HttpClient,
        private _metadataService: MetadataService,
        private _signerService: SignerService,
        private _indexedDBService: IndexedDBService,
        private _relayService: RelayService,
        private _sanitizer: DomSanitizer
    ) { }

    get chat$(): Observable<Chat | null> {
        return this._chat.asObservable();
    }

    get chats$(): Observable<Chat[] | null> {
        return this._chats.asObservable();
    }

    get contact$(): Observable<Contact | null> {
        return this._contact.asObservable();
    }

    get contacts$(): Observable<Contact[] | null> {
        return this._contacts.asObservable();
    }

    get profile$(): Observable<Profile | null> {
        return this._profile.asObservable();
    }

    async getContact(pubkey: string): Promise<void> {
        try {

            const metadata = await this._metadataService.fetchMetadataWithCache(pubkey);

            if (metadata) {

                const contact: Contact = {
                    pubKey: pubkey,
                    displayName: metadata.name,
                    picture: metadata.picture,
                    about: metadata.about
                };
                this._contact.next(contact);


                this._indexedDBService.getMetadataStream()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((updatedMetadata) => {

                        if (updatedMetadata && updatedMetadata.pubkey === pubkey) {
                            const updatedContact: Contact = {
                                pubKey: pubkey,
                                displayName: updatedMetadata.metadata.name,
                                picture: updatedMetadata.metadata.picture,
                                about: updatedMetadata.metadata.about
                            };

                            this._contact.next(updatedContact);
                        }
                    });
            }
        } catch (error) {
            console.error('Error fetching contact metadata:', error);
        }
    }

    getContacts(): Observable<Contact[]> {
        return new Observable<Contact[]>((observer) => {
            this._indexedDBService.getAllUsers()
                .then((cachedContacts: Contact[]) => {
                    if (cachedContacts.length > 0) {

                        this._contacts.next(cachedContacts);
                        observer.next(cachedContacts);
                    }

                    const pubkeys = cachedContacts.map(contact => contact.pubKey);
                    if (pubkeys.length > 0) {
                        this.subscribeToRealTimeContacts(pubkeys, observer);
                    }
                })
                .catch((error) => {
                    console.error('Error loading cached contacts from IndexedDB:', error);
                    observer.error(error);
                });


            return () => {
                console.log('Unsubscribing from contacts updates.');
            };
        });
    }

    private subscribeToRealTimeContacts(pubkeys: string[], observer: Subscriber<Contact[]>): void {
        this._metadataService.fetchMetadataForMultipleKeys(pubkeys)
            .then((metadataList: any[]) => {
                const updatedContacts = [...(this._contacts.value || [])];

                metadataList.forEach((metadata) => {
                    const contactIndex = updatedContacts.findIndex(c => c.pubKey === metadata.pubkey);
                    const newContact = {
                        pubKey: metadata.pubkey,
                        displayName: metadata.name,
                        picture: metadata.picture,
                        about: metadata.about
                    };

                    if (contactIndex !== -1) {

                        updatedContacts[contactIndex] = { ...updatedContacts[contactIndex], ...newContact };
                    } else {

                        updatedContacts.push(newContact);
                    }
                });


                this._contacts.next(updatedContacts);
                observer.next(updatedContacts);
            })
            .catch((error) => {
                console.error('Error fetching metadata for contacts:', error);
                observer.error(error);
            });
    }

    async getProfile(): Promise<void> {
        try {

            const publicKey = this._signerService.getPublicKey();
            const metadata = await this._metadataService.fetchMetadataWithCache(publicKey);
            if (metadata) {

                this._profile.next(metadata);

                this._indexedDBService.getMetadataStream()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((updatedMetadata) => {
                        if (updatedMetadata && updatedMetadata.pubkey === publicKey) {
                            this._profile.next(updatedMetadata.metadata);
                        }
                    });
            }
        } catch (error) {
            console.error('Error fetching profile metadata:', error);
        }
    }

    getChatById(id: string): Observable<Chat> {
        return this._httpClient.get<Chat>('api/apps/chat/chat', { params: { id } }).pipe(
            map((chat: Chat) => {
                this._chat.next(chat);
                return chat;
            }),
            switchMap((chat: Chat | null) => {
                if (!chat) {
                    return throwError('Could not find chat with id ' + id);
                }
                return of(chat);
            })
        );
    }



    async getChats(): Promise<Observable<Chat[]>> {
                const pubkey = this._signerService.getPublicKey();
        const useExtension = await this._signerService.isUsingExtension();         const decryptedPrivateKey = await this._signerService.getSecretKey("123");
                this.subscribeToChatList(pubkey, useExtension, decryptedPrivateKey);

                return this.getChatListStream();
    }



    subscribeToChatList(pubkey: string, useExtension: boolean, decryptedSenderPrivateKey: string): Observable<Chat[]> {
                this._relayService.ensureConnectedRelays().then(() => {
          const filters: Filter[] = [
            {
              kinds: [EncryptedDirectMessage],
              authors: [pubkey],             },
            {
              kinds: [EncryptedDirectMessage],
              '#p': [pubkey]             }
          ];

                    this._relayService.getPool().subscribeMany(this._relayService.getConnectedRelays(), filters, {
            onevent: async (event: NostrEvent) => {
              const otherPartyPubKey = event.pubkey === pubkey
                ? event.tags.find(tag => tag[0] === 'p')?.[1] || ''
                : event.pubkey;

              if (!otherPartyPubKey) return;

                            const lastTimestamp = this.latestMessageTimestamps[otherPartyPubKey] || 0;
              if (event.created_at > lastTimestamp) {
                this.latestMessageTimestamps[otherPartyPubKey] = event.created_at;
                this.messageQueue.push(event);
                this.processNextMessage(pubkey, useExtension, decryptedSenderPrivateKey);
              }
            },
            oneose: () => {
              console.log('Subscription closed');
              this._chats.next(this.chatList);
            }
          });
        });

        return this.getChatListStream();
      }

            private async processNextMessage(pubkey: string, useExtension: boolean, decryptedSenderPrivateKey: string): Promise<void> {
        if (this.isDecrypting || this.messageQueue.length === 0) return;

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
            const messageTimestamp = event.created_at * 1000;             this.addOrUpdateChatList(otherPartyPubKey, decryptedMessage, messageTimestamp);
          }
        } catch (error) {
          console.error('Failed to decrypt message:', error);
        } finally {
          this.isDecrypting = false;
          this.processNextMessage(pubkey, useExtension, decryptedSenderPrivateKey);
        }
      }

            private addOrUpdateChatList(pubKey: string, message: string, createdAt: number): void {
        const existingChat = this.chatList.find(chat => chat.contact?.pubKey === pubKey);

        if (existingChat) {
                    if (existingChat.lastMessageAt && new Date(existingChat.lastMessageAt).getTime() < createdAt) {
            existingChat.lastMessage = message;
            existingChat.lastMessageAt = new Date(createdAt).toISOString();
          }
        } else {
                    const newChat: Chat = {
            contact: { pubKey },
            lastMessage: message,
            lastMessageAt: new Date(createdAt).toISOString()
          };
          this.chatList.push(newChat);
          this.fetchMetadataForPubKey(pubKey);
        }

                this.chatList.sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());

                this._chats.next(this.chatList);
      }

            private fetchMetadataForPubKey(pubKey: string): void {
        this._metadataService.fetchMetadataWithCache(pubKey)
          .then(metadata => {
            const chat = this.chatList.find(chat => chat.contact?.pubKey === pubKey);
            if (chat && metadata) {
              chat.contact = { ...chat.contact, ...metadata };
              this._chats.next(this.chatList);
            }
          })
          .catch(error => {
            console.error(`Failed to fetch metadata for pubKey: ${pubKey}`, error);
          });
      }

            getChatListStream(): Observable<Chat[]> {
        return this._chats.asObservable();
      }

            private async decryptReceivedMessage(event: NostrEvent, useExtension: boolean, decryptedSenderPrivateKey: string, otherPartyPubKey: string): Promise<string> {
                        return 'Decrypted message';       }





    updateChat(id: string, chat: Chat): Observable<Chat> {
        return this.chats$.pipe(
            take(1),
            switchMap((chats: Chat[] | null) =>
                this._httpClient.patch<Chat>('api/apps/chat/chat', { id, chat }).pipe(
                    map((updatedChat: Chat) => {
                        if (chats) {
                            const index = chats.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                chats[index] = updatedChat;
                                this._chats.next(chats);
                            }
                        }
                        return updatedChat;
                    })
                )
            )
        );
    }

    resetChat(): void {
        this._chat.next(null);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
