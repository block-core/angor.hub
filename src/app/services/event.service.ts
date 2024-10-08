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
    likeEventSubject = new BehaviorSubject<NostrEvent | null>(null);

  constructor(
    private relayService: RelayService,
    private signerService: SignerService
  ) {}

  // Real-time subscription to generic events
  subscribeToEvents(filter: Filter): void {
    this.relayService.ensureConnectedRelays().then(() => {
      const connectedRelays = this.relayService.getConnectedRelays();

      if (connectedRelays.length === 0) {
        console.error('No relays are connected.');
        return;
      }

      // Subscribe to events using the filter
      this.relayService.getPool().subscribeMany(connectedRelays, [filter], {
        onevent: (event: NostrEvent) => {
          this.eventSubject.next(event); // Emit event in real-time
        },
        oneose: () => {
          console.log('Subscription to events closed.');
        }
      });
    }).catch(error => {
      console.error('Failed to subscribe to events:', error);
    });
  }

  // Real-time subscription to 'like' events
  subscribeToLikeEvents(pubkey: string): void {
    const filter: Filter = {
      kinds: [7], // Kind 7 represents 'like' events
      authors: [pubkey]
    };
    this.subscribeToEvents(filter); // Reuse generic subscribeToEvents method
  }

  // Real-time observer for 'like' events
  getLikeEventStream(): Observable<NostrEvent | null> {
    return this.likeEventSubject.asObservable();
  }

  // Send a 'like' event in real-time
  async sendLikeEvent(post: Post): Promise<void> {
    if (!post) return;

    try {
      const tags = post.getAllTags();
      const content = "+"; // Like symbol

      // Create unsigned 'like' event
      const unsignedEvent = this.signerService.getUnsignedEvent(7, tags, content);
      let signedEvent: NostrEvent;

      if (this.signerService.isUsingSecretKey()) {
        const privateKey = await this.signerService.getDecryptedSecretKey();
        const privateKeyBytes = hexToBytes(privateKey);
        signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes);
      } else {
        signedEvent = await this.signerService.signEventWithExtension(unsignedEvent);
      }

      // Publish the signed 'like' event to relays
      await this.relayService.publishEventToWriteRelays(signedEvent);
      console.log('Like event published successfully:', signedEvent);
    } catch (error) {
      console.error('Failed to send like event:', error);
    }
  }

  // Subscribe to specific event by ID in real-time
  async getEvent(id: string): Promise<void> {
    const filter: Filter = {
      kinds: [1], // Kind 1 for text notes
      ids: [id],
      limit: 1
    };

    this.subscribeToEvents(filter); // Reuse the subscribe method for the event
  }

  // Real-time subscription to post and replies
  async getPostAndReplies(id: string): Promise<void> {
    const postFilter: Filter = {
      ids: [id],
      kinds: [1],
      limit: 1
    };

    const replyFilter: Filter = {
      kinds: [1], // Kind 1 for text notes
      "#e": [id] // Fetch replies for the post with this ID
    };

    this.subscribeToEvents(postFilter);
    this.subscribeToEvents(replyFilter);
  }

  // Real-time subscription to Zap events
  async getZaps(filter: Filter): Promise<void> {
    this.subscribeToEvents(filter); // Reuse the subscribe method for zaps
  }

  // Helper method to convert NostrEvent to Post
  getPostFromResponse(response: NostrEvent, repostingPubkey: string = "", metadataService: MetadataService): Post {
    const nip10Result = nip10.parse(response);

    return new Post(
      response.kind,
      response.pubkey,
      response.content,
      response.id,
      response.created_at,
      nip10Result,
      repostingPubkey,
      metadataService // Pass MetadataService instance to the Post constructor
    );
}

}
