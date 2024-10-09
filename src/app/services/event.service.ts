import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NostrEvent, Filter, SimplePool, finalizeEvent, Event, nip10 } from 'nostr-tools';
import { RelayService } from './relay.service';
import { MetadataService } from './metadata.service';
import { throttleTime } from 'rxjs/operators';
import { SignerService } from './signer.service';
import * as dayjs from 'dayjs';
import { NewEvent } from 'app/types/NewEvent';
import { hexToBytes } from '@noble/hashes/utils';

// Job Queue to avoid spamming relays with too many requests at once
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
  private pageSize = 10;
  private noMoreEvents = new BehaviorSubject<boolean>(false);
  private seenEventIds = new Set<string>();

  // Interaction data
  private likesMap = new Map<string, number>();
  private repliesMap = new Map<string, number>();
  private zapsMap = new Map<string, number>();
  private repostsMap = new Map<string, number>();
  private hasLikedMap = new Map<string, boolean>();
  private hasRepostedMap = new Map<string, boolean>();

  // Job Queue for batching operations
  private jobQueue: Job[] = [];
  private isProcessingQueue = false;

  constructor(
    private relayService: RelayService,
    private signerService: SignerService,
    private metadataService: MetadataService
  ) {}

  // Get the event stream as an observable for subscription
  getEventStream(): Observable<NewEvent[]> {
    return this.eventsSubject.asObservable().pipe(throttleTime(2000));
  }

  // Determine if more events are available
  hasMoreEvents(): Observable<boolean> {
    return this.noMoreEvents.asObservable();
  }

  // Add a job to the queue
  private enqueueJob(eventId: string, jobType: 'replies' | 'likes' | 'zaps' | 'reposts'): void {
    this.jobQueue.push({ eventId, jobType });
    if (!this.isProcessingQueue) {
      this.processJobQueue();
    }
  }

  // Process the job queue with a delay to avoid overloading relays
  private async processJobQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.jobQueue.length > 0) {
      const job = this.jobQueue.shift();
      if (!job) break;

      try {
        switch (job.jobType) {
          case 'replies':
            await this.fetchReplies(job.eventId);
            break;
          case 'likes':
            await this.getLikers(job.eventId);
            break;
          case 'zaps':
            await this.getZapsCount(job.eventId);
            break;
          case 'reposts':
            await this.getReposters(job.eventId);
            break;
        }
        // Wait 500ms between each job to reduce relay load
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error processing job:', error);
      }
    }
    this.isProcessingQueue = false;
  }

  // Load more events based on provided public keys and filter only for type 1 events
  async loadMoreEvents(pubkeys: string[]): Promise<void> {
    if (this.isLoading.value || this.noMoreEvents.value) return;

    this.isLoading.next(true);

    const filter: Filter = {
      authors: pubkeys,
      kinds: [1], // Only load type 1 events (posts)
      until: this.lastLoadedEventTime || Math.floor(Date.now() / 1000),
      limit: this.pageSize,
    };

    try {
      const events = await this.fetchFilteredEvents(filter);
      if (events.length > 0) {
        this.lastLoadedEventTime = events[events.length - 1].created_at;

        const uniqueEvents = events.filter(event => !this.seenEventIds.has(event.id));
        uniqueEvents.forEach(event => this.seenEventIds.add(event.id));

        // Process events and cache interactions
        const newEvents = await Promise.all(uniqueEvents.map(event => this.createNewEvent(event)));

        // Add events to the subject
        this.eventsSubject.next([...this.eventsSubject.getValue(), ...newEvents]);

        // Stop further loading if fewer events than expected were received
        if (uniqueEvents.length < this.pageSize) {
          this.noMoreEvents.next(true);
        }
      } else {
        this.noMoreEvents.next(true); // No more events to load
      }
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      this.isLoading.next(false);
    }
  }

  // Fetch filtered events from relay(s)
  private async fetchFilteredEvents(filter: Filter): Promise<NostrEvent[]> {
    try {
      await this.relayService.ensureConnectedRelays();
      const connectedRelays = this.relayService.getConnectedRelays();

      if (!connectedRelays || connectedRelays.length === 0) {
        console.error('No connected relays available.');
        return [];
      }

      const eventSet = new Set<NostrEvent>();
      const pool = this.relayService.getPool();

      // Query events from relays
      await Promise.all(
        connectedRelays.map(async (relay) => {
          const events = await pool.querySync([relay], filter);
          events.forEach((event) => eventSet.add(event));
        })
      );

      return Array.from(eventSet);
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Create a NewEvent object from a NostrEvent
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

    // Fetch user metadata (username, picture)
    const metadata = await this.metadataService.fetchMetadataWithCache(event.pubkey);
    if (metadata) {
      newEvent.username = metadata.name || newEvent.npub;
      newEvent.picture = metadata.picture || "/images/avatars/avatar-placeholder.png";
    }

    // Fetch interaction counts
    newEvent.replyCount = this.getRepliesCount(event.id);
    newEvent.likeCount = this.getLikesCount(event.id);
    newEvent.zapCount = this.getZapsCount(event.id);
    newEvent.repostCount = this.getRepostsCount(event.id);

    // Check if the current user has liked or reposted this event
    newEvent.likedByMe = this.hasUserLiked(event.id);
    newEvent.repostedByMe = this.hasUserReposted(event.id);

    // Queue jobs to fetch replies, likers, reposters
    this.enqueueJob(event.id, 'replies');
    this.enqueueJob(event.id, 'likes');
    this.enqueueJob(event.id, 'reposts');
    this.enqueueJob(event.id, 'zaps');

    // Parse mentions and hashtags from content
    newEvent.mentions = this.extractMentions(event.content);
    newEvent.hashtags = this.extractHashtags(event.content);
    newEvent.nip10Result = this.getNip10Result(event);

    return newEvent;
  }

  // Parse NIP-10 thread structure (root, reply-to)
  getNip10Result(event: Event): any {
    return nip10.parse(event);
  }

  // Fetch replies for a given event
  private async fetchReplies(eventId: string): Promise<NostrEvent[]> {
    const replyFilter: Filter = {
      "#e": [eventId], // Reply tag
      kinds: [1], // Event kind
    };

    return await this.fetchFilteredEvents(replyFilter);
  }

  getRepliesCount(eventId: string): number {
    return this.repliesMap.get(eventId) || 0;
  }

  getLikesCount(eventId: string): number {
    return this.likesMap.get(eventId) || 0;
  }

  getZapsCount(eventId: string): number {
    return this.zapsMap.get(eventId) || 0;
  }

  getRepostsCount(eventId: string): number {
    return this.repostsMap.get(eventId) || 0;
  }

  hasUserLiked(eventId: string): boolean {
    return this.hasLikedMap.get(eventId) || false;
  }

  hasUserReposted(eventId: string): boolean {
    return this.hasRepostedMap.get(eventId) || false;
  }

  // Fetch list of users who liked a given event
  private async getLikers(eventId: string): Promise<string[]> {
    const likeFilter: Filter = {
      "#e": [eventId],
      kinds: [7], // Like kind
    };

    const likeEvents = await this.fetchFilteredEvents(likeFilter);
    return likeEvents.map(event => event.pubkey);
  }

  // Fetch list of users who reposted a given event
  private async getReposters(eventId: string): Promise<string[]> {
    const repostFilter: Filter = {
      "#e": [eventId],
      kinds: [6], // Repost kind
    };

    const repostEvents = await this.fetchFilteredEvents(repostFilter);
    return repostEvents.map(event => event.pubkey);
  }

  // Extract mentions from event content
  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  // Extract hashtags from event content
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1]);
    }
    return hashtags;
  }

  // Send a like event to the relay
  async sendLikeEvent(event: NewEvent): Promise<void> {
    if (!event) return;

    try {
      const tags = event.tags || [];
      const content = '❤️'; // Default content for like events

      // Create an unsigned like event
      const unsignedEvent = this.signerService.getUnsignedEvent(7, tags, content);
      let signedEvent: NostrEvent;

      // Sign the event using either the private key or browser extension
      if (this.signerService.isUsingSecretKey()) {
        const privateKey = await this.signerService.getDecryptedSecretKey();
        const privateKeyBytes = hexToBytes(privateKey);
        signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes);
      } else {
        signedEvent = await this.signerService.signEventWithExtension(unsignedEvent);
      }

      // Publish the like event to the relays
      await this.relayService.publishEventToWriteRelays(signedEvent);
      console.log('Like event published successfully:', signedEvent);

      // Update the like count and mark it as liked by the user
      const eventId = event.id;
      this.likesMap.set(eventId, (this.likesMap.get(eventId) || 0) + 1);
      this.hasLikedMap.set(eventId, true);
    } catch (error) {
      console.error('Failed to send like event:', error);
    }
  }
}
