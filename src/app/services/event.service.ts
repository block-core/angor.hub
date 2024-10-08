import { Injectable } from '@angular/core';
import { RelayService } from './relay.service';
import { SignerService } from './signer.service';
import { Filter, finalizeEvent, nip10, NostrEvent } from 'nostr-tools';
import { hexToBytes } from '@noble/hashes/utils';
import { Post, Zap } from 'app/types/post';
import { BehaviorSubject, Observable } from 'rxjs';
import { MetadataService } from './metadata.service';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    eventSubject = new BehaviorSubject<NostrEvent | null>(null);

    constructor(
        private relayService: RelayService,
        private signerService: SignerService
    ) { }


    subscribeToEvents(filter: Filter): void {
        this.relayService.ensureConnectedRelays().then(() => {
            const connectedRelays = this.relayService.getConnectedRelays();

            if (connectedRelays.length === 0) {
                console.error('No relays are connected.');
                return;
            }


            this.relayService.getPool().subscribeMany(connectedRelays, [filter], {
                onevent: (event: NostrEvent) => {
                    this.eventSubject.next(event);
                },
                oneose: () => {
                    console.log('Subscription to events closed.');
                }
            });
        }).catch(error => {
            console.error('Failed to subscribe to events:', error);
        });
    }


    async sendLikeEvent(post: Post): Promise<void> {
        if (!post) return;

        try {
            const tags = post.getAllTags();
            const content = "❤️";


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
            console.log('Like event published successfully:', signedEvent);
        } catch (error) {
            console.error('Failed to send like event:', error);
        }
    }


    async getEvent(id: string): Promise<void> {
        const filter: Filter = {
            kinds: [1],
            ids: [id],
            limit: 1
        };

        this.subscribeToEvents(filter);
    }


    async getPostAndReplies(id: string): Promise<void> {
        const postFilter: Filter = {
            ids: [id],
            kinds: [1],
            limit: 1
        };

        const replyFilter: Filter = {
            kinds: [1],
            "#e": [id]
        };

        this.subscribeToEvents(postFilter);
        this.subscribeToEvents(replyFilter);
    }


    async getZaps(filter: Filter): Promise<void> {
        this.subscribeToEvents(filter);
    }






    getPostFromResponse(response: NostrEvent, metadataService: MetadataService, repostingPubkey: string = ""): Post {
        const nip10Result = nip10.parse(response);

        return new Post(
            response.kind,
            response.pubkey,
            response.content,
            response.id,
            response.created_at,
            nip10Result,
            repostingPubkey,
            metadataService
        );
    }







    async fetchFilteredEvents(filter: Filter): Promise<NostrEvent[]> {
        try {

            await this.relayService.ensureConnectedRelays();


            const relays = this.relayService.getConnectedRelays();

            if (!relays || relays.length === 0) {
                throw new Error("No connected relays available.");
            }


            const eventSet = new Set<NostrEvent>();
            const pool = this.relayService.getPool();


            await Promise.all(
                relays.map(async (relay) => {
                    const events = await pool.querySync([relay], filter);
                    events.forEach(event => eventSet.add(event));
                })
            );


            return Array.from(eventSet);

        } catch (error) {
            console.error("Error fetching events:", error);
            throw error;
        }
    }



    async fetchPosts(filter: Filter, metadataService: MetadataService): Promise<Post[]> {

        const events = await this.fetchFilteredEvents(filter);


        const muteList: string[] = this.signerService.getMuteList();


        let posts: Post[] = [];


        events.forEach(event => {
            posts.push(this.getPostFromResponse(event, metadataService));
        });

        return posts;
    }

}
