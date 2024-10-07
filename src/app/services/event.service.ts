import { Injectable } from '@angular/core';
import { RelayService } from './relay.service';
import { SignerService } from './signer.service';
import { Filter, finalizeEvent, nip10, NostrEvent, SimplePool } from 'nostr-tools';
import { hexToBytes } from '@noble/hashes/utils';
import { Post, Zap } from 'app/types/post';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(
    private relayService: RelayService,
    private signerService: SignerService
  ) {}

  // Method to send a 'like' event
  async sendLikeEvent(post: Post): Promise<void> {
    if (!post) return;

    try {
      const tags = post.getAllTags();
      const content = "+";  // Indicating a 'like' with simple '+'

      // Create an unsigned 'like' event
      let unsignedEvent = this.signerService.getUnsignedEvent(7, tags, content);
      let signedEvent: NostrEvent;

      // Check if a secret key is used and handle event signing accordingly
      if (this.signerService.isUsingSecretKey) {
        const privateKey = await this.signerService.getDecryptedSecretKey();
        const privateKeyBytes = hexToBytes(privateKey);
        signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes);
      } else {
        signedEvent = await this.signerService.signEventWithExtension(unsignedEvent);
      }

      // Publish the signed event to write relays
      await this.relayService.publishEventToWriteRelays(signedEvent);
      console.log('Like event published successfully:', signedEvent);
    } catch (error) {
      console.error('Failed to send like event:', error);
    }
  }

  // Generic method to get a response from relays based on a filter
  async poolGet(filter: Filter): Promise<NostrEvent> {
    const pool = this.relayService.getPool();
    const relays = await this.relayService.getConnectedRelays();
    const response = await pool.get(relays, filter);
    pool.close(relays);
    return response;
  }

  // Method to fetch mute list for a given public key
  async getMuteList(pubkey: string): Promise<void> {
    const filter: Filter = {
      authors: [pubkey],
      kinds: [10000], // Mute list kind
      limit: 1
    };

    const response = await this.poolGet(filter);
    if (response) {
      this.signerService.setMuteListFromTags(response.tags);
    } else {
      this.signerService.setMuteList([]);
    }
  }

  // Method to add a public key to the mute list
  async addToMuteList(pubkey: string): Promise<void> {
    const muteList = this.signerService.getMuteList() || [];
    const tags = [["p", pubkey], ...muteList.map(m => ["p", m])];

    // Create an unsigned mute list event
    const unsignedEvent = this.signerService.getUnsignedEvent(10000, tags, "");

    let signedEvent: NostrEvent;
    const privateKey = await this.signerService.getDecryptedSecretKey();

    // Sign the event based on available private key
    if (privateKey) {
      const privateKeyBytes = hexToBytes(privateKey);
      signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes);
    } else {
      signedEvent = await this.signerService.signEventWithExtension(unsignedEvent);
    }

    // Publish the mute list update to relays
    await this.relayService.publishEventToWriteRelays(signedEvent);

    // Refresh the mute list after updating
    await this.getMuteList(this.signerService.getPublicKey());
  }

  // Fetch post by ID
  async getPost(id: string): Promise<Post | undefined> {
    const filter: Filter = {
      kinds: [1], // Kind 1 for text notes
      limit: 1,
      ids: [id]
    };

    const response = await this.poolGet(filter);
    if (response) {
      return this.getPostFromResponse(response);
    }
    return undefined;
  }

  // Fetch posts of kind 1 (text notes)
  async getKind1(filter: Filter, repostingPubkey: string = ""): Promise<Post[]> {
    filter.kinds = [1]; // Kind 1 for text notes

    const response = await this.poolList([filter]);
    const muteList: string[] = this.signerService.getMuteList();
    const posts = response
      .filter(e => !muteList.includes(e.pubkey)) // Exclude muted users
      .map(e => this.getPostFromResponse(e, repostingPubkey));

    return posts;
  }

  // Fetch posts of kind 1 and 6 (text notes and reposts)
  async getKind1and6(filter: Filter): Promise<Post[]> {
    filter.kinds = [1, 6]; // Kind 1 for text notes, Kind 6 for reposts

    const response = await this.poolList([filter]);
    return response.map(e => this.getPostFromResponse(e));
  }

  // Fetch post and its replies
  async getPostAndReplies(id: string): Promise<Post[]> {
    const postFilter: Filter = {
      ids: [id],
      kinds: [1],
      limit: 1
    };

    const replyFilter: Filter = {
        kinds: [1], // Kind 1 for text notes
        "#e": [id]  // Fetch replies for the post with this ID
      };

      const response = await this.poolList([postFilter, replyFilter]);
      const posts = response.map(e => this.getPostFromResponse(e));

      return posts;
    }

    // Fetch reply counts based on filters
    async getReplyCounts(filters: Filter[]): Promise<Post[]> {
      const response = await this.poolList(filters);
      return response.map(e => this.getPostFromResponse(e));
    }

    // Fetch feed based on filters
    async getFeed(filters: Filter[]): Promise<Post[]> {
      const response = await this.poolList(filters);
      return response.map(e => this.getPostFromResponse(e));
    }

// Helper method to convert NostrEvent to Post
getPostFromResponse(response: NostrEvent, repostingPubkey: string = "") {
    let nip10Result = nip10.parse(response);
    return new Post(
        response.kind,
        response.pubkey,
        response.content,
        response.id,
        response.created_at,
        nip10Result,
        repostingPubkey
    );
}

async getMyLikes(): Promise<string[]> {
    const myLikesFilter: Filter = {
        kinds: [7],
        authors: [this.signerService.getPublicKey()]
    };

    const myLikes = await this.getKind7(myLikesFilter);
    const myLikedNoteIds: string[] = [];

    myLikes.forEach(like => {
        try {
            const tag = like.tags[like.tags.length - 2];
            if (tag[0] === "e") {
                const id = tag[1];
                myLikedNoteIds.push(id); // Collect liked note IDs
            }
        } catch (error) {
            console.log("Error processing like event:", error);
        }
    });

    return myLikedNoteIds; // Return the array of liked note IDs
}



async getKind7(filter: Filter): Promise<NostrEvent[]> {
     filter.kinds = [7];

     return await this.poolList([filter]);
}


async poolList(filters: Filter[]): Promise<NostrEvent[]> {
    // Create a new instance of SimplePool
    const pool = new SimplePool();

    // Get the relay URLs
    const relays = await this.relayService.getConnectedRelays();

    // Initialize an empty array to store the events
    let events: NostrEvent[] = [];

    try {
        // Loop through each filter and query the pool for matching events
        for (const filter of filters) {
            const response = await pool.querySync(relays, filter);
            events.push(...response); // Append the results to the events array
        }
    } catch (error) {
        console.error("Error fetching events from relays:", error);
        throw error; // Re-throw the error to handle it at the caller level
    } finally {
        // Close the connections to the relays after querying
        pool.close(relays);
    }

    return events;
}

async getZaps(filter: Filter) {

    const response = await this.poolList([filter])
    console.log(response);
    let zaps: Zap[] = [];
    response.forEach(e => {

        zaps.push(new Zap(e.id, e.kind, e.pubkey, e.created_at, e.sig, e.tags));
    });
    return zaps;
}

  }

