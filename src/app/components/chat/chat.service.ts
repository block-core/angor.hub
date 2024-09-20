import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError, of, Subscriber } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { Chat, Contact, Profile } from 'app/components/chat/chat.types';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { MetadataService } from 'app/services/metadata.service';
import { SignerService } from 'app/services/signer.service';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
    // BehaviorSubjects to hold the state of chats, contacts, and profiles
    private _chat: BehaviorSubject<Chat | null> = new BehaviorSubject(null);
    private _chats: BehaviorSubject<Chat[] | null> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(null);
    private _profile: BehaviorSubject<Profile | null> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    /**
     * Constructor to inject necessary services
     */
    constructor(
        private _httpClient: HttpClient,
        private _metadataService: MetadataService,
        private _signerService: SignerService,
        private _indexedDBService: IndexedDBService,
        private _sanitizer: DomSanitizer
    ) {}

    /**
     * Observable streams for chat, chats, contact, contacts, and profile
     */
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

    /**
     * Fetch all chats from the server
     */
    getChats(): Observable<Chat[]> {
        return this._httpClient.get<Chat[]>('api/apps/chat/chats').pipe(
            tap((chats: Chat[]) => {
                this._chats.next(chats);
            })
        );
    }

    /**
     * Fetch a contact by ID
     */
    getContact(id: string): Observable<Contact> {
        return this._httpClient.get<Contact>('api/apps/chat/contacts', { params: { id } }).pipe(
            tap((contact: Contact) => {
                this._contact.next(contact);
            })
        );
    }

    /**
     * Fetch all contacts from the server
     */
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
                    console.error('Error loading cached contacts:', error);
                    observer.error(error);
                });

            return () => {
                // Cleanup logic if needed (for example, closing subscriptions)
            };
        });
    }

    private subscribeToRealTimeContacts(pubkeys: string[], observer: Subscriber<Contact[]>): void {
        this._metadataService.fetchMetadataForMultipleKeys(pubkeys)
            .then((metadataList: any[]) => {
                metadataList.forEach((metadata) => {
                    const contact = this._contacts.value?.find(c => c.pubKey === metadata.pubkey);
                    if (contact) {
                        contact.displayName = metadata.name;
                        contact.picture = metadata.picture;
                        contact.about = metadata.about;
                    } else {
                        const updatedContacts = [...(this._contacts.value || []), {
                            pubKey: metadata.pubkey,
                            displayName: metadata.name,
                            picture: metadata.picture,
                            about: metadata.about
                        }];
                        this._contacts.next(updatedContacts);
                        observer.next(updatedContacts);
                    }
                });

                observer.next(this._contacts.value || []);
            })
            .catch((error) => {
                console.error('Error fetching metadata for contacts:', error);
                observer.error(error);
            });
    }



    /**
     * Fetch the profile metadata using the public key and subscribe to real-time updates
     */
    async getProfile(): Promise<void> {
        try {
            const publicKey = this._signerService.getPublicKey();
            const metadata = await this._metadataService.fetchMetadataWithCache(publicKey);

            if (metadata) {
                this._profile.next(metadata);

                // Subscribe to real-time metadata updates
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

    /**
     * Fetch chat by ID and handle the case if the chat is not found
     */
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

    /**
     * Update a chat and synchronize the state of the chats array
     */
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

    /**
     * Reset the selected chat
     */
    resetChat(): void {
        this._chat.next(null);
    }

    /**
     * Clean up all subscriptions when the service is destroyed
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
