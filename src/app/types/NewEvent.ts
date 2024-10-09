import dayjs from "dayjs";
import { NostrEvent } from "nostr-tools";
import { NIP10Result } from "nostr-tools/nip10";

export class NewEvent {
    nostrEvent: NostrEvent;
    kind: number;                // Event kind (e.g., post, like, zap)
    content: string;             // Content of the event
    pubkey: string;              // Public key of the event creator
    npub: string;                // Nostr public key (npub)
    noteId: string;              // Unique identifier (ID) for the event
    createdAt: number;           // Timestamp when the event was created
    date: Date;                  // Date object for the event creation time
    fromNow: string;             // Human-readable relative time (e.g., "5 minutes ago")
    username: string = "";       // Username of the event creator
    picture: string = "/images/avatars/avatar-placeholder.png"; // Profile picture of the event creator
    replyCount: number = 0;      // Number of replies to the event
    likeCount: number = 0;       // Number of likes for the event
    zapCount: number = 0;        // Number of zaps for the event (if applicable)
    repostCount: number = 0;     // Number of reposts/shares for the event
    likedByMe: boolean = false;  // Whether the event is liked by the current user
    replies: NewEvent[] = [];    // Array of replies to this event
    likers: string[] = [];       // List of public keys of users who liked this event
    reposters: string[] = [];    // List of public keys of users who reposted this event
    zappers: string[] = [];      // List of public keys of users who zapped this event
    relatedEventIds: string[] = [];// Array of related event IDs (e.g., parent event, root event)
    rootEventId: string = "";    // Root event ID in case of a thread or conversation
    replyToEventId: string = ""; // Parent event ID if this is a reply to another event
    mentions: string[] = [];     // List of public keys mentioned in the event content
    hashtags: string[] = [];     // List of hashtags used in the event content
    repostedByMe: boolean = false; // Whether the event is reposted by the current user
    nip10Result: NIP10Result;
    tags: string[][] = [];       // Array of tags for the event
    id: any;
    isAReply: boolean = false;

    constructor(id :any ,kind: number, pubkey: string, content: string, noteId: string, createdAt: number ,tags: string[][] = []) {
        this.kind = kind;
        this.pubkey = pubkey;
        this.content = content;
        this.noteId = noteId;
        this.createdAt = createdAt;
        this.date = new Date(this.createdAt * 1000);
        this.fromNow = dayjs(this.date).fromNow();
        this.tags = tags;
        this.id = id;
    }
}
