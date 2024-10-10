import { NostrEvent } from "nostr-tools";
import { NIP10Result } from "nostr-tools/nip10";

export class NewEvent {
    nostrEvent: NostrEvent;
    kind: number;
    content: string;
    pubkey: string;
    npub: string;
    noteId: string;
    createdAt: number;
    date: Date;
    fromNow: string;
    username: string = '';
    picture: string = '/images/avatars/avatar-placeholder.png';
    replyCount: number = 0;
    likeCount: number = 0;
    zapCount: number = 0;
    repostCount: number = 0;
    likedByMe: boolean = false;
    replies: NewEvent[] = [];
    likers: string[] = [];
    reposters: string[] = [];
    zappers: string[] = [];
    relatedEventIds: string[] = [];
    rootEventId: string = '';
    replyToEventId: string = '';
    mentions: string[] = [];
    hashtags: string[] = [];
    repostedByMe: boolean = false;
    nip10Result: NIP10Result;
    tags: string[][] = [];
    id: any;
    isAReply: boolean = false;

    constructor(
        id: any,
        kind: number,
        pubkey: string,
        content: string,
        noteId: string,
        createdAt: number,
        tags: string[][] = []
    ) {
        this.kind = kind;
        this.pubkey = pubkey;
        this.content = content;
        this.noteId = noteId;
        this.createdAt = createdAt;
        this.date = new Date(this.createdAt * 1000);
        this.fromNow = this.calculateTimeFromNow(this.date);
        this.tags = tags;
        this.id = id;
    }

    calculateTimeFromNow(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minutes ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hours ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} days ago`;
        } else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months} months ago`;
        } else {
            const years = Math.floor(diffInSeconds / 31536000);
            return `${years} years ago`;
        }
    }
}
