import { Injectable, OnDestroy } from '@angular/core';
import { Chat, Contact, Profile } from 'app/components/chat/chat.types';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { MetadataService } from 'app/services/metadata.service';
import { RelayService } from 'app/services/relay.service';
import { SignerService } from 'app/services/signer.service';
import { Filter, getEventHash, NostrEvent } from 'nostr-tools';
import { EncryptedDirectMessage } from 'nostr-tools/kinds';
import {
    BehaviorSubject,
    from,
    Observable,
    of,
    Subject,
    throwError,
} from 'rxjs';
import {
    catchError,
    filter,
    map,
    switchMap,
    take,
    takeUntil,
    tap,
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
    private chatList: Chat[] = [];
    private latestMessageTimestamps: { [pubKey: string]: number } = {};
    private messageQueue: NostrEvent[] = [];
    private isDecrypting = false;
    private recipientPublicKey: string;
    private message: string;
    private decryptedPrivateKey: string = '';
    private _chat: BehaviorSubject<Chat | null> = new BehaviorSubject(null);
    private _chats: BehaviorSubject<Chat[] | null> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(
        null
    );
    private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(
        null
    );
    private _profile: BehaviorSubject<Profile | null> = new BehaviorSubject(
        null
    );
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _metadataService: MetadataService,
        private _signerService: SignerService,
        private _indexedDBService: IndexedDBService,
        private _relayService: RelayService
    ) {}
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

    checkCurrentChatOnPageRefresh(chatIdFromURL: string): void {
        if (chatIdFromURL) {
            const currentChat = this._chat.value;
            this.getChatById(chatIdFromURL).subscribe((chat) => {
                if (chat) {
                    this._chat.next(chat);
                    this.loadChatHistory(chatIdFromURL);
                }
            });
        }
    }

    async getContact(pubkey: string): Promise<void> {
        try {
            if (!pubkey) {
                return;
            }

            const metadata =
                await this._metadataService.fetchMetadataWithCache(pubkey);
            if (metadata) {
                const contact: Contact = {
                    pubKey: pubkey,
                    displayName: metadata.name ? metadata.name : 'Unknown',
                    picture: metadata.picture,
                    about: metadata.about,
                };
                this._contact.next(contact);

                this._indexedDBService
                    .getMetadataStream()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((updatedMetadata) => {
                        if (
                            updatedMetadata &&
                            updatedMetadata.pubkey === pubkey
                        ) {
                            const updatedContact: Contact = {
                                pubKey: pubkey,
                                displayName: updatedMetadata.metadata.name
                                    ? updatedMetadata.metadata.name
                                    : 'Unknown',
                                picture: updatedMetadata.metadata.picture,
                                about: updatedMetadata.metadata.about,
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
            this._indexedDBService
                .getAllUsers()
                .then((cachedContacts: Contact[]) => {
                    if (cachedContacts && cachedContacts.length > 0) {
                        const validatedContacts = cachedContacts.map(
                            (contact) => {
                                if (!contact.pubKey) {
                                    console.error(
                                        'Contact is missing pubKey:',
                                        contact
                                    );
                                }
                                return contact;
                            }
                        );

                        this._contacts.next(validatedContacts);
                        observer.next(validatedContacts);
                    } else {
                        observer.next([]);
                    }
                    observer.complete();
                })
                .catch((error) => {
                    console.error(
                        'Error loading cached contacts from IndexedDB:',
                        error
                    );
                    observer.next([]);
                    observer.complete();
                });

            return { unsubscribe() {} };
        });
    }

    async updateChatListMetadata(): Promise<void> {
        const pubKeys = this.chatList
            .map((chat) => chat.contact?.pubKey)
            .filter((pubKey) => pubKey);
        if (pubKeys.length > 0) {
            const metadataList =
                await this._metadataService.fetchMetadataForMultipleKeys(
                    pubKeys
                );

            metadataList.forEach((metadata) => {
                const contact = this._contacts.value?.find(
                    (contact) => contact.pubKey === metadata.pubkey
                );
                if (contact) {
                    contact.displayName = metadata.metadata.name || 'Unknown';
                    contact.picture =
                        metadata.metadata.picture || contact.picture;
                    contact.about = metadata.metadata.about || contact.about;
                }

                const chat = this.chatList.find(
                    (chat) => chat.contact?.pubKey === metadata.pubkey
                );
                if (chat) {
                    chat.contact.displayName =
                        metadata.metadata.name || 'Unknown';
                    chat.contact.picture =
                        metadata.metadata.picture || chat.contact.picture;
                    chat.contact.about =
                        metadata.metadata.about || chat.contact.about;
                }
            });

            this._chats.next(this.chatList);
            this._contacts.next(this._contacts.value || []);
        }
    }

    private subscribeToRealTimeMetadataUpdates(pubKey: string): void {
        this._metadataService
            .getMetadataStream()
            .pipe(
                filter(
                    (updatedMetadata) =>
                        updatedMetadata && updatedMetadata.pubkey === pubKey
                )
            )
            .subscribe((updatedMetadata) => {
                const chat = this.chatList.find(
                    (chat) => chat.contact?.pubKey === pubKey
                );
                if (chat) {
                    chat.contact.displayName =
                        updatedMetadata.metadata.name || 'Unknown';
                    chat.contact.picture =
                        updatedMetadata.metadata.picture ||
                        chat.contact.picture;
                    chat.contact.about =
                        updatedMetadata.metadata.about || chat.contact.about;
                    this._chats.next(this.chatList);
                }

                const contact = this._contacts.value?.find(
                    (contact) => contact.pubKey === pubKey
                );
                if (contact) {
                    contact.displayName =
                        updatedMetadata.metadata.name || 'Unknown';
                    contact.picture =
                        updatedMetadata.metadata.picture || contact.picture;
                    contact.about =
                        updatedMetadata.metadata.about || contact.about;
                    this._contacts.next(this._contacts.value || []);
                }
            });
    }

    async getProfile(): Promise<void> {
        try {
            const publicKey = this._signerService.getPublicKey();
            const metadata =
                await this._metadataService.fetchMetadataWithCache(publicKey);
            if (metadata) {
                this._profile.next(metadata);

                this._indexedDBService
                    .getMetadataStream()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((updatedMetadata) => {
                        if (
                            updatedMetadata &&
                            updatedMetadata.pubkey === publicKey
                        ) {
                            this._profile.next(updatedMetadata.metadata);
                        }
                    });
            }
        } catch (error) {
            console.error('Error fetching profile metadata:', error);
        }
    }

    async getChats(): Promise<Observable<Chat[]>> {
        return this.getChatListStream().pipe(
            tap((chats) => {
                if (chats && chats.length === 0) {
                    return;
                }

                const pubKeys = chats
                    .filter((chat) => chat.contact?.pubKey)
                    .map((chat) => chat.contact!.pubKey);

                // Subscribe to all metadata updates in parallel
                this.subscribeToRealTimeMetadataUpdatesBatch(pubKeys);
            })
        );
    }

    async InitSubscribeToChatList(): Promise<Observable<Chat[]>> {
        const pubkey = this._signerService.getPublicKey();
        const useExtension = await this._signerService.isUsingExtension();
        const useSecretKey = await this._signerService.isUsingSecretKey();

        this.decryptedPrivateKey = useSecretKey
            ? await this._signerService.getDecryptedSecretKey()
            : '';

        // Perform metadata and chat loading in parallel for speed
        await Promise.all([
            this.updateChatListMetadata(),
            this.subscribeToChatList(
                pubkey,
                useExtension,
                useSecretKey,
                this.decryptedPrivateKey
            ),
        ]);

        return this.getChatListStream();
    }

    private subscribeToRealTimeMetadataUpdatesBatch(pubKeys: string[]): void {
        // Batch subscribe to all pubKeys metadata updates for efficiency
        pubKeys.forEach((pubKey) => {
            this.subscribeToRealTimeMetadataUpdates(pubKey);
        });
    }

    subscribeToChatList(
        pubkey: string,
        useExtension: boolean,
        useSecretKey: boolean,
        decryptedSenderPrivateKey: string
    ): Observable<Chat[]> {
        this._relayService.ensureConnectedRelays().then(async () => {
            const filters: Filter[] = [
                {
                    kinds: [EncryptedDirectMessage],
                    authors: [pubkey],
                    limit: 1500,
                },
                {
                    kinds: [EncryptedDirectMessage],
                    '#p': [pubkey],
                    limit: 1500,
                },
            ];

            this._relayService
                .getPool()
                .subscribeMany(
                    this._relayService.getConnectedRelays(),
                    filters,
                    {
                        onevent: async (event: NostrEvent) => {
                            const otherPartyPubKey =
                                event.pubkey === pubkey
                                    ? event.tags.find(
                                          (tag) => tag[0] === 'p'
                                      )?.[1] || ''
                                    : event.pubkey;

                            if (!otherPartyPubKey) return;

                            const lastTimestamp =
                                this.latestMessageTimestamps[
                                    otherPartyPubKey
                                ] || 0;
                            if (event.created_at > lastTimestamp) {
                                this.messageQueue.push(event);
                                this.processNextMessage(
                                    pubkey,
                                    useExtension,
                                    useSecretKey,
                                    decryptedSenderPrivateKey
                                );
                            }
                        },
                        oneose: () => {
                            const currentChats = this.chatList || [];
                            if (currentChats.length > 0) {
                                this._chats.next(this.chatList);
                            }
                        },
                    }
                );
        });

        return this.getChatListStream();
    }

    private async processNextMessage(
        pubkey: string,
        useExtension: boolean,
        useSecretKey: boolean,
        decryptedSenderPrivateKey: string
    ): Promise<void> {
        if (this.isDecrypting || this.messageQueue.length === 0) return;

        this.isDecrypting = true;

        try {
            while (this.messageQueue.length > 0) {
                const event = this.messageQueue.shift();
                if (!event) continue;

                const isSentByUser = event.pubkey === pubkey;
                const otherPartyPubKey = isSentByUser
                    ? event.tags.find((tag) => tag[0] === 'p')?.[1] || ''
                    : event.pubkey;

                if (!otherPartyPubKey) continue;

                const decryptedMessage = await this.decryptReceivedMessage(
                    event,
                    useExtension,
                    useSecretKey,
                    decryptedSenderPrivateKey,
                    otherPartyPubKey
                );

                if (decryptedMessage) {
                    this.addOrUpdateChatList(
                        otherPartyPubKey,
                        decryptedMessage,
                        event.created_at,
                        isSentByUser
                    );
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.isDecrypting = false;
        }
    }

    private addOrUpdateChatList(
        pubKey: string,
        message: string,
        createdAt: number,
        isMine: boolean
    ): void {
        const existingChat = this.chatList.find(
            (chat) => chat.contact?.pubKey === pubKey
        );

        const newMessage = {
            id: `${pubKey}-${createdAt}`,
            chatId: pubKey,
            contactId: pubKey,
            isMine,
            value: message,
            createdAt: new Date(createdAt * 1000).toISOString(),
        };

        if (existingChat) {
            const messageExists = existingChat.messages?.some(
                (m) => m.id === newMessage.id
            );

            if (!messageExists) {
                existingChat.messages = [
                    ...(existingChat.messages || []),
                    newMessage,
                ].sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );

                if (Number(existingChat.lastMessageAt) < createdAt) {
                    existingChat.lastMessage = message;
                    existingChat.lastMessageAt = createdAt.toString();
                }
            }
        } else {
            const contactInfo = this._contacts.value?.find(
                (contact) => contact.pubKey === pubKey
            ) || { pubKey };

            const newChat: Chat = {
                id: pubKey,
                contact: {
                    pubKey: contactInfo.pubKey,
                    name: contactInfo.name || 'Unknown',
                    picture:
                        contactInfo.picture ||
                        '/images/avatars/avatar-placeholder.png',
                    about: contactInfo.about || '',
                    displayName:
                        contactInfo.displayName ||
                        contactInfo.name ||
                        'Unknown',
                },
                lastMessage: message,
                lastMessageAt: createdAt.toString(),
                messages: [newMessage],
            };
            this.chatList.push(newChat);
        }

        this.chatList.sort(
            (a, b) => Number(b.lastMessageAt!) - Number(a.lastMessageAt!)
        );
        this._chats.next(this.chatList);
    }

    getChatListStream(): Observable<Chat[]> {
        return this._chats.asObservable();
    }

    private async decryptReceivedMessage(
        event: NostrEvent,
        useExtension: boolean,
        useSecretKey: boolean,
        decryptedSenderPrivateKey: string,
        recipientPublicKey: string
    ): Promise<string> {
        if (useExtension && !useSecretKey) {
            return await this._signerService.decryptMessageWithExtension(
                recipientPublicKey,
                event.content
            );
        } else if (useSecretKey && !useExtension) {
            return await this._signerService.decryptMessage(
                decryptedSenderPrivateKey,
                recipientPublicKey,
                event.content
            );
        }
    }

    private async loadChatHistory(pubKey: string): Promise<void> {
        const myPubKey = this._signerService.getPublicKey();

        const historyFilter: Filter[] = [
            {
                kinds: [EncryptedDirectMessage],
                authors: [myPubKey],
                '#p': [pubKey],
                limit: 10,
            },
            {
                kinds: [EncryptedDirectMessage],
                authors: [pubKey],
                '#p': [myPubKey],
                limit: 10,
            },
        ];

        this._relayService
            .getPool()
            .subscribeMany(
                this._relayService.getConnectedRelays(),
                historyFilter,
                {
                    onevent: async (event: NostrEvent) => {
                        const isSentByMe = event.pubkey === myPubKey;
                        const senderOrRecipientPubKey = isSentByMe
                            ? pubKey
                            : event.pubkey;
                        const useExtension =
                            await this._signerService.isUsingExtension();
                        const useSecretKey =
                            await this._signerService.isUsingSecretKey();
                        const decryptedMessage =
                            await this.decryptReceivedMessage(
                                event,
                                useExtension,
                                useSecretKey,
                                this.decryptedPrivateKey,
                                senderOrRecipientPubKey
                            );

                        if (decryptedMessage) {
                            const messageTimestamp = Math.floor(
                                event.created_at
                            );

                            this.addOrUpdateChatList(
                                pubKey,
                                decryptedMessage,
                                messageTimestamp,
                                isSentByMe
                            );
                            this._chat.next(
                                this.chatList.find((chat) => chat.id === pubKey)
                            );
                        }
                    },
                    oneose: () => {},
                }
            );
    }

    private async fetchChatHistory(pubKey: string): Promise<any[]> {
        const myPubKey = this._signerService.getPublicKey();

        const historyFilter: Filter[] = [
            {
                kinds: [EncryptedDirectMessage],
                authors: [myPubKey],
                '#p': [pubKey],
                limit: 10,
            },
            {
                kinds: [EncryptedDirectMessage],
                authors: [pubKey],
                '#p': [myPubKey],
                limit: 10,
            },
        ];

        const messages: any[] = [];

        this._relayService
            .getPool()
            .subscribeMany(
                this._relayService.getConnectedRelays(),
                historyFilter,
                {
                    onevent: async (event: NostrEvent) => {
                        const isSentByMe = event.pubkey === myPubKey;
                        const senderOrRecipientPubKey = isSentByMe
                            ? pubKey
                            : event.pubkey;
                        const useExtension =
                            await this._signerService.isUsingExtension();
                        const useSecretKey =
                            await this._signerService.isUsingSecretKey();
                        const decryptedMessage =
                            await this.decryptReceivedMessage(
                                event,
                                useExtension,
                                useSecretKey,
                                this.decryptedPrivateKey,
                                senderOrRecipientPubKey
                            );

                        if (decryptedMessage) {
                            const messageTimestamp = Math.floor(
                                event.created_at
                            );

                            const message = {
                                id: event.id,
                                chatId: pubKey,
                                contactId: senderOrRecipientPubKey,
                                isMine: isSentByMe,
                                value: decryptedMessage,
                                createdAt: new Date(
                                    messageTimestamp * 1000
                                ).toISOString(),
                            };

                            messages.push(message);

                            this.addOrUpdateChatList(
                                pubKey,
                                decryptedMessage,
                                messageTimestamp,
                                isSentByMe
                            );
                            this._chat.next(
                                this.chatList.find((chat) => chat.id === pubKey)
                            );
                        }
                    },
                    oneose: () => {},
                }
            );

        await new Promise((resolve) => setTimeout(resolve, 1000));

        return messages;
    }

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

                return from(
                    this._relayService.publishEventToRelays(event)
                ).pipe(
                    map(() => {
                        if (chats) {
                            const index = chats.findIndex(
                                (item) => item.id === id
                            );
                            if (index !== -1) {
                                chats[index] = chat;
                                this._chats.next(chats);
                            }
                        }
                        return chat;
                    }),
                    catchError((error) => {
                        console.error(
                            'Failed to update chat via Nostr:',
                            error
                        );
                        return throwError(error);
                    })
                );
            })
        );
    }

    getChatById(id: string, contact: Contact = null): Observable<Chat> {
        this.recipientPublicKey = id;

        return from(Promise.all([this._signerService.getPublicKey()])).pipe(
            switchMap(() => {
                return this.chats$.pipe(
                    take(1),
                    switchMap((chats: Chat[] | null) => {
                        if (!chats || chats.length === 0) {
                            return this.createNewChat(id, contact);
                        }

                        const cachedChat = chats.find((chat) => chat.id === id);
                        if (cachedChat) {
                            this._chat.next(cachedChat);
                            this.loadChatHistory(this.recipientPublicKey);
                            return of(cachedChat);
                        }

                        return this.createNewChat(id, contact);
                    })
                );
            }),
            catchError((error) => {
                console.error('Error fetching chat by id from Nostr:', error);
                return throwError(error);
            })
        );
    }

    createNewChat(id: string, contact: Contact = null): Observable<Chat> {
        // const existingChat = this._chats.value?.find(chat => chat.id === id);

        // if (existingChat) {
        //      return of(existingChat);
        // }
        const newChat: Chat = {
            id: id || '',
            contact: contact
                ? {
                      pubKey: contact.pubKey || id,
                      name: contact.name || 'Unknown',
                      picture:
                          contact.picture ||
                          '/images/avatars/avatar-placeholder.png',
                  }
                : {
                      pubKey: id,
                      name: 'Unknown',
                      picture: '/images/avatars/avatar-placeholder.png',
                  },
            lastMessage: 'new chat...',
            lastMessageAt: Math.floor(Date.now() / 1000).toString() || '0',
            messages: [],
        };

        // const updatedChats = this._chats.value ? [...this._chats.value, newChat] : [newChat];
        // this._chats.next(updatedChats);
        // this._chat.next(newChat);
        return from(this._metadataService.fetchMetadataWithCache(id)).pipe(
            map((metadata: any) => {
                newChat.contact = {
                    pubKey: id,
                    name: metadata?.name || 'Unknown',
                    picture:
                        metadata?.picture ||
                        '/images/avatars/avatar-placeholder.png',
                    about: metadata?.about || '',
                    displayName:
                        metadata?.displayName || metadata?.name || 'Unknown',
                };

                return newChat;
            }),
            switchMap((chat) => {
                return from(this.fetchChatHistory(id)).pipe(
                    map((messages: any[]) => {
                        if (messages.length === 0) {
                            const testMessage = {
                                id: `${id}-new-chat`,
                                chatId: id,
                                contactId: id,
                                isMine: true,
                                value: 'new chat...',
                                createdAt: Math.floor(
                                    Date.now() / 1000
                                ).toString(),
                            };

                            messages.push(testMessage);
                        }

                        newChat.messages = messages;

                        if (messages.length > 0) {
                            const lastMessage = messages[messages.length - 1];
                            newChat.lastMessage = lastMessage.value;
                            newChat.lastMessageAt = lastMessage.createdAt;
                        }

                        const updatedChatsWithMessages = this._chats.value
                            ? [...this._chats.value, newChat]
                            : [newChat];
                        this._chats.next(updatedChatsWithMessages);
                        this._chat.next(newChat);

                        return newChat;
                    })
                );
            })
        );
    }

    resetChat(): void {
        this._chat.next(null);
    }

    public async sendPrivateMessage(message: string): Promise<void> {
        try {
            this.message = message;

            const useExtension = await this._signerService.isUsingExtension();
            const useSecretKey = await this._signerService.isUsingSecretKey();
            if (useExtension && !useSecretKey) {
                await this.handleMessageSendingWithExtension();
            } else if (!useExtension && useSecretKey) {
                if (!this.isValidMessageSetup()) {
                    console.error(
                        'Message, sender private key, or recipient public key is not properly set.'
                    );
                    return;
                }
                const encryptedMessage =
                    await this._signerService.encryptMessage(
                        this.decryptedPrivateKey,
                        this.recipientPublicKey,
                        this.message
                    );

                const messageEvent = this._signerService.getUnsignedEvent(
                    4,
                    [['p', this.recipientPublicKey]],
                    encryptedMessage
                );

                const signedEvent = this._signerService.getSignedEvent(
                    messageEvent,
                    this.decryptedPrivateKey
                );

                const published =
                    await this._relayService.publishEventToRelays(signedEvent);

                if (published) {
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
            const encryptedMessage =
                await this._signerService.encryptMessageWithExtension(
                    this.message,
                    this.recipientPublicKey
                );

            const signedEvent =
                await this._signerService.signEventWithExtension({
                    kind: 4,
                    pubkey: this._signerService.getPublicKey(),
                    tags: [['p', this.recipientPublicKey]],
                    content: encryptedMessage,
                    created_at: Math.floor(Date.now() / 1000),
                });

            const published =
                await this._relayService.publishEventToRelays(signedEvent);

            if (published) {
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
