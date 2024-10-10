import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NostrEvent, Filter, finalizeEvent } from 'nostr-tools';
import { RelayService } from './relay.service';
import { MetadataService } from './metadata.service';
import { throttleTime, debounceTime } from 'rxjs/operators';
import { SignerService } from './signer.service';
import { NewEvent } from 'app/types/NewEvent';
import { hexToBytes } from '@noble/hashes/utils';

interface Job {
    eventId: string;
    jobType: 'replies' | 'likes' | 'zaps' | 'reposts';
}

@Injectable({
    providedIn: 'root',
})
export class PaginatedEventService {
    private eventsSubject = new BehaviorSubject<NewEvent[]>([]);
    private isLoading = new BehaviorSubject<boolean>(false);
    private lastLoadedEventTime: number | null = null;
    private pageSize = 20;
    private noMoreEvents = new BehaviorSubject<boolean>(false);
    private seenEventIds = new Set<string>();


    private likesMap = new Map<string, string[]>();
    private repliesMap = new Map<string, NewEvent[]>();
    private zapsMap = new Map<string, string[]>();
    private repostsMap = new Map<string, string[]>();
    private hasLikedMap = new Map<string, boolean>();
    private hasRepostedMap = new Map<string, boolean>();

    private jobQueue: Job[] = [];
    private isProcessingQueue = false;

    constructor(
        private relayService: RelayService,
        private signerService: SignerService,
        private metadataService: MetadataService
    ) {}


     async subscribeToEvents(pubkeys:string[]): Promise<void> {
        await this.relayService.ensureConnectedRelays();
        const connectedRelays = this.relayService.getConnectedRelays();

        if (!connectedRelays || connectedRelays.length === 0) {
            console.error('No connected relays available.');
            return;
        }

        const filters: Filter[] = [
            {
                kinds: [1],
                authors: pubkeys,
                limit: this.pageSize
            },
            {
                '#p': pubkeys,
                limit: 1
            }
        ];


        this.relayService.getPool().subscribeMany(connectedRelays, filters, {
            onevent: (event: NostrEvent) => {
                if (!this.isReply(event)) {

                    this.handleNewOrUpdatedEvent(event);
                }

                const parentEventId = this.getParentEventId(event);
                if (parentEventId) {
                    this.enqueueJob(parentEventId, 'replies');
                }


                switch (event.kind) {
                    case 7:
                        this.enqueueJob(parentEventId, 'likes');
                        break;
                    case 9735:
                        this.enqueueJob(parentEventId, 'zaps');
                        break;
                    case 6:
                        this.enqueueJob(parentEventId, 'reposts');
                        break;
                    default:
                }
            },
            oneose: () => {
                //console.log('Subscription to relays closed.');
            },
        });

    }

private getParentEventId(event: NostrEvent): string | null {
    const replyTag = event.tags.find(tag => tag[0] === 'e');
    return replyTag ? replyTag[1] : null;
}


    private async handleNewOrUpdatedEvent(event: NostrEvent): Promise<void> {
        switch (event.kind) {
            case 1:
                if (!this.seenEventIds.has(event.id)) {
                    this.seenEventIds.add(event.id);
                    const newEvent = await this.createNewEvent(event);
                    const currentEvents = this.eventsSubject.getValue();
                    this.eventsSubject.next(
                        [newEvent, ...currentEvents].sort((a, b) => b.createdAt - a.createdAt)
                    );
                    this.updateEventInSubject(event.id);
                }
                break;

            case 7:
                this.handleLikeEvent(event);
                break;

            case 9735:
                this.handleZapEvent(event);
                break;

            case 6:
                this.handleRepostEvent(event);
                break;

            case 4:
                this.handleReplyEvent(event);
                break;

            default:
         }
    }


    private handleLikeEvent(event: NostrEvent): void {
        const eventId = event.tags.find(tag => tag[0] === 'e')?.[1];
        if (eventId) {
            const currentEvents = this.eventsSubject.getValue();
            const updatedEvents = currentEvents.map(e => {
                if (e.id === eventId) {
                    e.likeCount += 1;
                    e.likers = [...(e.likers || []), event.pubkey];
                }
                return e;
            });
            this.eventsSubject.next(updatedEvents);
        }
    }


    private handleZapEvent(event: NostrEvent): void {
        const eventId = event.tags.find(tag => tag[0] === 'e')?.[1];
        if (eventId) {
            const currentEvents = this.eventsSubject.getValue();
            const updatedEvents = currentEvents.map(e => {
                if (e.id === eventId) {
                    e.zapCount += 1;
                    e.zappers = [...(e.zappers || []), event.pubkey];
                }
                return e;
            });
            this.eventsSubject.next(updatedEvents);
        }
    }


    private handleRepostEvent(event: NostrEvent): void {
        const eventId = event.tags.find(tag => tag[0] === 'e')?.[1];
        if (eventId) {
            const currentEvents = this.eventsSubject.getValue();
            const updatedEvents = currentEvents.map(e => {
                if (e.id === eventId) {
                    e.repostCount += 1;
                    e.reposters = [...(e.reposters || []), event.pubkey];
                }
                return e;
            });
            this.eventsSubject.next(updatedEvents);
        }
    }


    private async handleReplyEvent(event: NostrEvent): Promise<void> {
        const eventId = event.tags.find(tag => tag[0] === 'e')?.[1];
        if (eventId) {
            const replyEvent = await this.createNewEvent(event);
            const currentEvents = this.eventsSubject.getValue();
            const updatedEvents = currentEvents.map(e => {
                if (e.id === eventId) {
                    e.replyCount += 1;
                    e.replies = [...(e.replies || []), replyEvent];
                }
                return e;
            });
            this.eventsSubject.next(updatedEvents);
        }
    }

    private isReply(event: NostrEvent): boolean {
        const replyTags = event.tags.filter(tag => tag[0] === 'e' || tag[0] === 'p');
        return replyTags.length > 0;
    }


    async loadMoreEvents(pubkeys: string[]): Promise<void> {
        if (this.isLoading.value || this.noMoreEvents.value) return;

        this.isLoading.next(true);

        const filter: Filter = {
            authors: pubkeys,
            kinds: [1],
            until: this.lastLoadedEventTime || Math.floor(Date.now() / 1000),
            limit: this.pageSize,
        };

        try {
            const events = await this.fetchFilteredEvents(filter);

            if (events.length < this.pageSize) {
                this.noMoreEvents.next(true);
            }

            if (events.length > 0) {
                this.lastLoadedEventTime = events[events.length - 1].created_at;

                const uniqueEvents = events.filter(event => !this.seenEventIds.has(event.id) && !this.isReply(event));
                uniqueEvents.forEach(event => this.seenEventIds.add(event.id));

                const newEvents = await Promise.all(uniqueEvents.map(event => this.createNewEvent(event)));


                this.eventsSubject.next([...this.eventsSubject.getValue(), ...newEvents].sort((a, b) => b.createdAt - a.createdAt));
            } else {
                this.noMoreEvents.next(true);
            }
        } catch (error) {
            console.error('Error loading more events:', error);
        } finally {
            this.isLoading.next(false);
        }
    }


    private async fetchFilteredEvents(filter: Filter): Promise<NostrEvent[]> {
        await this.relayService.ensureConnectedRelays();
        const connectedRelays = this.relayService.getConnectedRelays();
        if (!connectedRelays || connectedRelays.length === 0) {
            console.error('No connected relays available.');
            return [];
        }

        const eventMap = new Map<string, NostrEvent>();
        const pool = this.relayService.getPool();

        await Promise.all(
            connectedRelays.map(async (relay) => {
                const events = await pool.querySync([relay], filter);
                events.forEach(event => {
                    if (!eventMap.has(event.id)) {
                        eventMap.set(event.id, event);
                    }
                });
            })
        );

        return Array.from(eventMap.values());
    }


    private async createNewEvent(event: NostrEvent): Promise<NewEvent> {
        const newEvent = new NewEvent(
            event.id,
            event.kind,
            event.pubkey,
            event.content,
            event.id,
            event.created_at,
            event.tags
        );

        this.enqueueJob(event.id, 'replies');
        this.enqueueJob(event.id, 'likes');
        this.enqueueJob(event.id, 'reposts');
        this.enqueueJob(event.id, 'zaps');
        await this.processJobQueue();

        const metadata = await this.metadataService.fetchMetadataWithCache(event.pubkey);
        if (metadata) {
            newEvent.username = metadata.name || newEvent.npub;
            newEvent.picture = metadata.picture || "/images/avatars/avatar-placeholder.png";
        }

        return newEvent;
    }


    private enqueueJob(eventId: string, jobType: 'replies' | 'likes' | 'zaps' | 'reposts'): void {
        if (!this.jobQueue.some(job => job.eventId === eventId && job.jobType === jobType)) {
            this.jobQueue.push({ eventId, jobType });
            if (!this.isProcessingQueue) {
                this.processJobQueue();
            }
        }
    }

    private async processJobQueue(): Promise<void> {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;

        const activeJobs: Promise<void>[] = [];
        while (this.jobQueue.length > 0 || activeJobs.length > 0) {
            while (this.jobQueue.length > 0 && activeJobs.length < 10) {
                const job = this.jobQueue.shift();
                if (!job) break;

                const jobPromise = this.processJob(job);
                activeJobs.push(jobPromise);

                jobPromise.then(() => {
                    activeJobs.splice(activeJobs.indexOf(jobPromise), 1);
                }).catch((error) => {
                    console.error('Error processing job:', error);
                    activeJobs.splice(activeJobs.indexOf(jobPromise), 1);
                });
            }
            await Promise.race(activeJobs);
        }

        this.isProcessingQueue = false;
    }

    private async processJob(job: Job): Promise<void> {
        switch (job.jobType) {
            case 'replies':
                const replies = await this.fetchReplies(job.eventId);
                this.repliesMap.set(job.eventId, replies);
                break;
            case 'likes':
                const likers = await this.getLikers(job.eventId);
                this.likesMap.set(job.eventId, likers);
                break;
            case 'zaps':
                const zappers = await this.getZappers(job.eventId);
                this.zapsMap.set(job.eventId, zappers);
                break;
            case 'reposts':
                const reposters = await this.getReposters(job.eventId);
                this.repostsMap.set(job.eventId, reposters);
                break;
        }

        this.updateEventInSubject(job.eventId);
    }

    private updateEventInSubject(eventId: string): void {
        const currentEvents = this.eventsSubject.getValue();
        const updatedEvents = currentEvents.map(event => {
            if (event.id === eventId) {
                event.replyCount = this.getRepliesCount(eventId);
                event.replies = this.repliesMap.get(eventId) || [];
                event.likeCount = this.getLikesCount(eventId);
                event.likers = this.likesMap.get(eventId) || [];
                event.zapCount = this.getZapsCount(eventId);
                event.zappers = this.zapsMap.get(eventId) || [];
                event.repostCount = this.getRepostsCount(eventId);
                event.reposters = this.repostsMap.get(eventId) || [];
            }
            return event;
        });
        this.eventsSubject.next(updatedEvents);
    }


    private async fetchReplies(eventId: string): Promise<NewEvent[]> {
        const replyFilter: Filter = {
            "#e": [eventId],
            kinds: [1],
        };

        const events = await this.fetchFilteredEvents(replyFilter);

        const uniqueEventMap = new Map<string, NostrEvent>();
        events.forEach(event => {
            if (!uniqueEventMap.has(event.id)) {
                uniqueEventMap.set(event.id, event);
            }
        });

        return Promise.all(Array.from(uniqueEventMap.values()).map(event => this.createNewEvent(event)));
    }


    private async getLikers(eventId: string): Promise<string[]> {
        const likeFilter: Filter = {
            "#e": [eventId],
            kinds: [7],
        };

        const likeEvents = await this.fetchFilteredEvents(likeFilter);
        return likeEvents.map(event => event.pubkey);
    }


    private async getZappers(eventId: string): Promise<string[]> {
        const zapFilter: Filter = {
            "#e": [eventId],
            kinds: [9735],
        };

        const zapEvents = await this.fetchFilteredEvents(zapFilter);
        return zapEvents.map(event => event.pubkey);
    }


    private async getReposters(eventId: string): Promise<string[]> {
        const repostFilter: Filter = {
            "#e": [eventId],
            kinds: [6],
        };

        const repostEvents = await this.fetchFilteredEvents(repostFilter);
        return repostEvents.map(event => event.pubkey);
    }


    getRepliesCount(eventId: string): number {
        return (this.repliesMap.get(eventId) || []).length;
    }

    getLikesCount(eventId: string): number {
        return (this.likesMap.get(eventId) || []).length;
    }

    getZapsCount(eventId: string): number {
        return (this.zapsMap.get(eventId) || []).length;
    }

    getRepostsCount(eventId: string): number {
        return (this.repostsMap.get(eventId) || []).length;
    }


    hasUserLiked(eventId: string): boolean {
        return this.hasLikedMap.get(eventId) || false;
    }

    hasUserReposted(eventId: string): boolean {
        return this.hasRepostedMap.get(eventId) || false;
    }


    getEventStream(): Observable<NewEvent[]> {
        return this.eventsSubject.asObservable().pipe(throttleTime(3000));
    }


    hasMoreEvents(): Observable<boolean> {
        return this.noMoreEvents.asObservable();
    }

    async sendTextEvent(content: string): Promise<void> {
        if (!content) return;

        try {
             const tags: string[][] = [];

            const unsignedEvent = this.signerService.getUnsignedEvent(1, tags, content);
            let signedEvent: NostrEvent;

            if (this.signerService.isUsingSecretKey()) {
                const privateKey = await this.signerService.getDecryptedSecretKey();
                const privateKeyBytes = hexToBytes(privateKey);
                signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes);
            } else {
                signedEvent = await this.signerService.signEventWithExtension(unsignedEvent);
             }

            await this.relayService.publishEventToWriteRelays(signedEvent);
        } catch (error) {
            console.error('Failed to send text event:', error);
        }
    }




    async sendLikeEvent(event: NewEvent): Promise<void> {
        if (!event) return;

        try {
            const tags = [
                ["e", event.id],
                ["p", event.pubkey],
            ];
            const content = '+';

            const unsignedEvent = this.signerService.getUnsignedEvent(7, tags, content);
            let signedEvent: NostrEvent;

            if (this.signerService.isUsingSecretKey()) {
                const privateKey = await this.signerService.getDecryptedSecretKey();
                const privateKeyBytes = hexToBytes(privateKey);
                signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes);
            } else {
                signedEvent = await this.signerService.signEventWithExtension(unsignedEvent);
            }

              await this.relayService.publishEventToWriteRelays(signedEvent);


            this.likesMap.set(event.id, [...(this.likesMap.get(event.id) || []), this.signerService.getPublicKey()]);
            this.hasLikedMap.set(event.id, true);
        } catch (error) {
            console.error('Failed to send like event:', error);
        }
    }

    async sendZapEvent(event: NewEvent, zapAmount: number): Promise<void> {
        if (!event || zapAmount <= 0) return;

        try {
            const tags = [
                ["e", event.id],
                ["p", event.pubkey],
                ["amount", zapAmount.toString()]
            ];
            const content = `Zapped with ${zapAmount} sats`;

            const unsignedEvent = this.signerService.getUnsignedEvent(9735, tags, content);
            let signedEvent: NostrEvent;

            if (this.signerService.isUsingSecretKey()) {
                const privateKey = await this.signerService.getDecryptedSecretKey();
                const privateKeyBytes = hexToBytes(privateKey);
                signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes);
            } else {
                signedEvent = await this.signerService.signEventWithExtension(unsignedEvent);
            }

            await this.relayService.publishEventToWriteRelays(signedEvent);
        } catch (error) {
            console.error('Failed to send zap event:', error);
        }
    }

    async sendReplyEvent(parentEvent: NewEvent, replyContent: string): Promise<void> {
        if (!parentEvent) return;

        try {
            const tags = [
                ["e", parentEvent.id],
                ["p", parentEvent.pubkey],
            ];

            const unsignedEvent = this.signerService.getUnsignedEvent(1, tags, replyContent);
            let signedEvent: NostrEvent;

            if (this.signerService.isUsingSecretKey()) {
                const privateKey = await this.signerService.getDecryptedSecretKey();
                const privateKeyBytes = hexToBytes(privateKey);
                signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes);
            } else {
                signedEvent = await this.signerService.signEventWithExtension(unsignedEvent);
            }

            await this.relayService.publishEventToWriteRelays(signedEvent);
        } catch (error) {
            console.error('Failed to send reply event:', error);
        }
    }

}
