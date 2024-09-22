import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError, of, Subscriber, from } from 'rxjs';
import { catchError, concatMap, distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { Chat, Contact, Profile } from 'app/components/chat/chat.types';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { MetadataService } from 'app/services/metadata.service';
import { SignerService } from 'app/services/signer.service';
import { Filter, nip04, NostrEvent, Relay, UnsignedEvent } from 'nostr-tools';
import { RelayService } from 'app/services/relay.service';
import { EncryptedDirectMessage } from 'nostr-tools/kinds';
import { getEventHash } from 'nostr-tools';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
    private chatList: Chat[] = [];
    private latestMessageTimestamps: { [pubKey: string]: number } = {};
    private messageQueue: NostrEvent[] = [];
    private isDecrypting = false;
    private recipientPublicKey: string;
    private message: string;


    private _chat: BehaviorSubject<Chat | null> = new BehaviorSubject(null);
    private _chats: BehaviorSubject<Chat[] | null> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(null);
    private _profile: BehaviorSubject<Profile | null> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _metadataService: MetadataService,
        private _signerService: SignerService,
        private _indexedDBService: IndexedDBService,
        private _relayService: RelayService,
        private _sanitizer: DomSanitizer,
        private router: Router,

    ) { }
    get profile$(): Observable<Profile | null> {
        return this._profile.asObservable();
    }


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



// Fetch a contact by public key
async getContact(pubkey: string): Promise<void> {
    try {
        if (!pubkey) {
            console.error('Public key is undefined.');
            return;
        }

        const metadata = await this._metadataService.fetchMetadataWithCache(pubkey);
        if (metadata) {
            const contact: Contact = {
                pubKey: pubkey, // Ensure pubKey is set
                displayName: metadata.name,
                picture: metadata.picture,
                about: metadata.about
            };
            this._contact.next(contact);

            // Subscribe to metadata stream for updates
            this._indexedDBService.getMetadataStream()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((updatedMetadata) => {
                    if (updatedMetadata && updatedMetadata.pubkey === pubkey) {
                        const updatedContact: Contact = {
                            pubKey: pubkey, // Ensure pubKey is updated here as well
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


// Fetch contacts from IndexedDB and subscribe to real-time updates
getContacts(): Observable<Contact[]> {
    return new Observable<Contact[]>((observer) => {
        this._indexedDBService.getAllUsers()
            .then((cachedContacts: Contact[]) => {
                if (cachedContacts.length > 0) {
                    // Ensure each contact has pubKey set
                    cachedContacts.forEach(contact => {
                        if (!contact.pubKey) {
                            console.error('Contact is missing pubKey:', contact);
                        }
                    });

                    this._contacts.next(cachedContacts);
                    observer.next(cachedContacts);
                }

                const pubkeys = cachedContacts
                    .map(contact => contact.pubKey)
                    .filter(pubkey => pubkey); // Filter out undefined pubkeys

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


    // Subscribe to real-time updates for contacts
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

    // Fetch profile of the user
    async getProfile(): Promise<void> {
        try {
            const publicKey = this._signerService.getPublicKey();
            const metadata = await this._metadataService.fetchMetadataWithCache(publicKey);
            if (metadata) {
                this._profile.next(metadata);

                // Subscribe to updates in the metadata stream
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


    // Fetch chats and subscribe to updates, including messages
    async getChats(): Promise<Observable<Chat[]>> {
        const pubkey = this._signerService.getPublicKey();
        const useExtension = await this._signerService.isUsingExtension();
        const decryptedPrivateKey = await this._signerService.getSecretKey("123");
        this.subscribeToChatList(pubkey, useExtension, decryptedPrivateKey);

        // Optionally fetch older messages (history) if needed
        this.chatList.forEach(chat => this.loadChatHistory(chat.id!));

        return this.getChatListStream();
    }

    // Subscribe to chat list updates based on filters
    subscribeToChatList(pubkey: string, useExtension: boolean, decryptedSenderPrivateKey: string): Observable<Chat[]> {
        this._relayService.ensureConnectedRelays().then(() => {
            const filters: Filter[] = [
                { kinds: [EncryptedDirectMessage], authors: [pubkey] ,limit:25},
                { kinds: [EncryptedDirectMessage], '#p': [pubkey] ,limit:25}
            ];

            this._relayService.getPool().subscribeMany(this._relayService.getConnectedRelays(), filters, {
                onevent: async (event: NostrEvent) => {
                    const otherPartyPubKey = event.pubkey === pubkey
                        ? event.tags.find(tag => tag[0] === 'p')?.[1] || ''
                        : event.pubkey;

                    if (!otherPartyPubKey) return;

                    const lastTimestamp = this.latestMessageTimestamps[otherPartyPubKey] || 0;
                    if (event.created_at > lastTimestamp) {
                        this.messageQueue.push(event);

                        // Update the real-time chat messages when they are processed
                        await this.processNextMessage(pubkey, useExtension, decryptedSenderPrivateKey);
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


    // Process each message in the queue
    private async processNextMessage(pubkey: string, useExtension: boolean, decryptedSenderPrivateKey: string): Promise<void> {
        if (this.isDecrypting || this.messageQueue.length === 0) return;

        this.isDecrypting = true;

        try {
            while (this.messageQueue.length > 0) {
                const event = this.messageQueue.shift();
                if (!event) continue;

                const isSentByUser = event.pubkey === pubkey;
                const otherPartyPubKey = isSentByUser
                    ? event.tags.find(tag => tag[0] === 'p')?.[1] || ''
                    : event.pubkey;

                if (!otherPartyPubKey) continue;

                const decryptedMessage = await this.decryptReceivedMessage(
                    event,
                    useExtension,
                    decryptedSenderPrivateKey,
                    otherPartyPubKey
                );

                if (decryptedMessage) {
                    const messageTimestamp = event.created_at * 1000;
                    this.addOrUpdateChatList(otherPartyPubKey, decryptedMessage, messageTimestamp, isSentByUser);

                    // Update UI with the latest messages
                    const chatToUpdate = this.chatList.find(chat => chat.id === otherPartyPubKey);
                    if (chatToUpdate) {
                        this._chat.next(chatToUpdate);

                    }
                }
            }
        } catch (error) {
            console.error('Failed to decrypt message:', error);
        } finally {
            this.isDecrypting = false;
        }
    }



    // Add or update chat in the chat list, including messages
// Add or update chat in the chat list, including messages
private addOrUpdateChatList(pubKey: string, message: string, createdAt: number, isMine: boolean): void {
    const existingChat = this.chatList.find(chat => chat.contact?.pubKey === pubKey);

    const newMessage = {
        id: `${pubKey}-${createdAt}`,
        chatId: pubKey,
        contactId: pubKey,
        isMine,
        value: message,
        createdAt: new Date(createdAt).toISOString(),
    };

    // Save current selected chat
    const currentChat = this._chat.value;

    if (existingChat) {
        // Check if the message already exists to avoid duplicates
        const messageExists = existingChat.messages?.some(m => m.id === newMessage.id);

        if (!messageExists) {
            existingChat.messages = (existingChat.messages || []).concat(newMessage)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            if (new Date(existingChat.lastMessageAt!).getTime() < createdAt) {
                existingChat.lastMessage = message;
                existingChat.lastMessageAt = new Date(createdAt).toLocaleDateString() + ' ' + new Date(createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
            }
        }
    } else {
        const contactInfo = this._contacts.value?.find(contact => contact.pubKey === pubKey) || { pubKey };

        const newChat: Chat = {
            id: pubKey,
            contact: {
                pubKey: contactInfo.pubKey,
                name: contactInfo.name || "Unknown",
                picture: contactInfo.picture || "/images/avatars/avatar-placeholder.png",
                about: contactInfo.about || "",
                displayName: contactInfo.displayName || contactInfo.name || "Unknown"
            },
            lastMessage: message,
            lastMessageAt: new Date(createdAt).toLocaleDateString() + ' ' + new Date(createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
            messages: [newMessage]
        };
        this.chatList.push(newChat);
        this.fetchMetadataForPubKey(pubKey);
    }

    // Sort chats by last message time
    this.chatList.sort((a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime());

    // Update the chat list and preserve the selected chat
    this._chats.next(this.chatList);

    // Restore the previously selected chat
    if (currentChat) {
        const restoredChat = this.chatList.find(chat => chat.id === currentChat.id);
        if (restoredChat) {
            this._chat.next(restoredChat);
        }
    }
}





    // Fetch metadata for a public key
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

    // Get chat list stream
    getChatListStream(): Observable<Chat[]> {
        return this._chats.asObservable();
    }

    // Decrypt received message
    private async decryptReceivedMessage(
        event: NostrEvent,
        useExtension: boolean,
        decryptedSenderPrivateKey: string,
        recipientPublicKey: string
    ): Promise<string> {
        if (useExtension) {
            return await this._signerService.decryptDMWithExtension( recipientPublicKey,event.content);
        } else {
            return await this._signerService.decryptMessage(decryptedSenderPrivateKey, recipientPublicKey, event.content);
        }
    }

    // Load older chat history (if needed)
    private async loadChatHistory(pubKey: string): Promise<void> {
        const myPubKey = this._signerService.getPublicKey();

        const historyFilter: Filter[] = [
            { kinds: [EncryptedDirectMessage], authors: [myPubKey], '#p': [pubKey]},
            { kinds: [EncryptedDirectMessage], authors: [pubKey], '#p': [myPubKey]}
        ];

        console.log("Subscribing to history for chat with: ", pubKey);

        this._relayService.getPool().subscribeMany(this._relayService.getConnectedRelays(), historyFilter, {
            onevent: async (event: NostrEvent) => {
                console.log("Received historical event: ", event); // Check if the event is received
                const isSentByMe = event.pubkey === myPubKey;
                const senderOrRecipientPubKey = isSentByMe ? pubKey : event.pubkey;
                const decryptedMessage = await this.decryptReceivedMessage(
                    event,
                    await this._signerService.isUsingExtension(),
                    await this._signerService.getSecretKey("123"),
                    senderOrRecipientPubKey
                );

                if (decryptedMessage) {
                    const messageTimestamp = event.created_at * 1000;

                    // Add message to chat and update UI
                    this.addOrUpdateChatList(pubKey, decryptedMessage, messageTimestamp, isSentByMe);
                    this._chat.next(this.chatList.find(chat => chat.id === pubKey)); // Ensure UI is updated with history
                }
            },
            oneose: () => {
                console.log(`Closed subscription for loading history of chat: ${pubKey}`);
            }
        });
    }


    // Update chat in the chat list
    updateChat(id: string, chat: Chat): Observable<Chat> {
        return this.chats$.pipe(
            take(1),
            switchMap((chats: Chat[] | null) => {
                const pubkey = chat.contact?.pubKey;

                if (!pubkey) {
                    return throwError('No public key found for this chat');
                }

                const event: any = {
                    kind: 4,
                    pubkey: pubkey,
                    content: JSON.stringify(chat),
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [['p', pubkey]],
                };

                event.id = getEventHash(event);

                return from(this._relayService.publishEventToRelays(event)).pipe(
                    map(() => {
                        if (chats) {
                            const index = chats.findIndex((item) => item.id === id);
                            if (index !== -1) {
                                chats[index] = chat;
                                this._chats.next(chats);
                            }
                        }
                        return chat;
                    }),
                    catchError((error) => {
                        console.error('Failed to update chat via Nostr:', error);
                        return throwError(error);
                    })
                );
            })
        );
    }

    // Get chat by ID
    getChatById(id: string): Observable<Chat> {
        this.recipientPublicKey = id;

        const pubkeyPromise = this._signerService.getPublicKey();
        const useExtensionPromise = this._signerService.isUsingExtension();
        const decryptedSenderPrivateKeyPromise = this._signerService.getSecretKey('123');

        return from(Promise.all([pubkeyPromise, useExtensionPromise, decryptedSenderPrivateKeyPromise])).pipe(
            switchMap(([pubkey, useExtension, decryptedSenderPrivateKey]) => {
                return this.chats$.pipe(
                    take(1),
                    distinctUntilChanged(),
                    filter((chats: Chat[] | null) => !!chats),
                    switchMap((chats: Chat[] | null) => {
                        const cachedChat = chats?.find(chat => chat.id === id);
                        if (cachedChat) {
                            this._chat.next(cachedChat);
                            console.log("Fetching chat history for: ", this.recipientPublicKey);

                            this.loadChatHistory(this.recipientPublicKey);
                            return of(cachedChat);
                        }

                        const newChat: Chat = {
                            id: this.recipientPublicKey,
                            contact: { pubKey: this.recipientPublicKey, picture: "/images/avatars/avatar-placeholder.png" },
                            lastMessage: '',
                            lastMessageAt: new Date().toISOString(),
                            messages: []
                        };

                        const updatedChats = chats ? [...chats, newChat] : [newChat];
                        this._chats.next(updatedChats);
                        this._chat.next(newChat);

                        console.log("Fetching chat history for: ", this.recipientPublicKey);

                        this.loadChatHistory(this.recipientPublicKey);
                        return of(newChat);
                    })
                );
            }),
            catchError((error) => {
                console.error('Error fetching chat by id from Nostr:', error);
                return throwError(error);
            })
        );
    }



    openChat(contact: Contact): Observable<Chat> {
        if (!contact.pubKey) {
            console.error('The contact does not have a public key!');
            return throwError('The contact does not have a public key!');
        }

        this.recipientPublicKey = contact.pubKey;

        const pubkey = this._signerService.getPublicKey();
        const useExtension = this._signerService.isUsingExtension();
        const decryptedSenderPrivateKey = this._signerService.getSecretKey('123');

        return this.chats$.pipe(
            take(1),
            distinctUntilChanged(),
            concatMap((chats: Chat[] | null) => {
                const cachedChat = chats?.find(chat => chat.id === contact.pubKey);
                if (cachedChat) {
                    this._chat.next(cachedChat);
                    console.log("Fetching chat history for: ", contact.pubKey);
                    this.loadChatHistory(contact.pubKey);
                    return of(cachedChat);
                }

                const newChat: Chat = {
                    id: contact.pubKey,
                    contact: {
                        pubKey: contact.pubKey,
                        name: contact.name,
                        picture: contact.picture || "/images/avatars/avatar-placeholder.png",
                        about: contact.about,
                        displayName: contact.displayName,
                    },
                    lastMessage: '',
                    lastMessageAt: new Date().toISOString(),
                    messages: []
                };

                const updatedChats = chats ? [...chats, newChat] : [newChat];
                this._chats.next(updatedChats);
                this._chat.next(newChat);

                console.log("Fetching chat history for: ", contact.pubKey);
                this.loadChatHistory(contact.pubKey);

                return of(newChat);
            }),
            catchError((error) => {
                console.error('Error fetching chat by ID:', error);
                const parentUrl = this.router.url.split('/').slice(0, -1).join('/');
                this.router.navigateByUrl(parentUrl);
                return throwError(error);
            })
        );
    }



    // Reset chat state
    resetChat(): void {
        this._chat.next(null);
    }


    public async sendPrivateMessage(message: string): Promise<void> {
        try {
            this.message = message;

            const useExtension = await this._signerService.isUsingExtension();

            if (useExtension) {
                await this.handleMessageSendingWithExtension();
            } else {
                const decryptedSenderPrivateKey = await this._signerService.getSecretKey("123");

                if (!this.isValidMessageSetup()) {
                    console.error('Message, sender private key, or recipient public key is not properly set.');
                    return;
                }

                const encryptedMessage = await this._signerService.encryptMessage(
                    decryptedSenderPrivateKey,
                    this.recipientPublicKey,
                    this.message
                );

                const messageEvent = this._signerService.getUnsignedEvent(4, [['p', this.recipientPublicKey]], encryptedMessage);

                const signedEvent = this._signerService.getSignedEvent(messageEvent, decryptedSenderPrivateKey);

                const published = await this._relayService.publishEventToRelays(signedEvent);

                if (published) {
                    console.log('Message sent successfully!');
                    this.message = '';
                } else {
                    console.error('Failed to send the message.');
                }
            }

        } catch (error) {
            console.error('Error sending private message:', error);
        }
    }

    private async handleMessageSendingWithExtension(): Promise<void> {
        try {
            const encryptedMessage = await this._signerService.encryptMessageWithExtension(
                this.message,
                this.recipientPublicKey
            );

            const signedEvent = await this._signerService.signEventWithExtension({
                kind: 4,
                pubkey: this._signerService.getPublicKey(),
                tags: [['p', this.recipientPublicKey]],
                content: encryptedMessage,
                created_at: Math.floor(Date.now() / 1000),
            });

            const published = await this._relayService.publishEventToRelays(signedEvent);

            if (published) {
                console.log('Message sent successfully with extension!');
                this.message = '';
            } else {
                console.error('Failed to send the message with extension.');
            }
        } catch (error) {
            console.error('Error sending message with extension:', error);
        }
    }

    private isValidMessageSetup(): boolean {
        return this.message.trim() !== '' && this.recipientPublicKey !== '';
    }

    // Clean up on destroy
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


}
