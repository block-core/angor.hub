import { Content } from 'app/types/post';
import { nip19 } from 'nostr-tools';

// kind 0 content - nostr
export interface Kind0Content {
    name?: string;
    username?: string;
    displayName?: string;
    website?: string;
    about?: string;
    picture?: string;
    banner?: string;
    lud06?: string;
    lud16?: string;
    nip05?: string;
    // can have other random stuff in here too
}

export interface DBUser {
    name: string;
    username: string;
    displayName: string;
    website: string;
    about: string;
    picture: string;
    banner: string;
    lud06: string;
    lud16: string;
    nip05: string;
    pubkey: string;
    npub: string;
    createdAt: string;
    apiKey: string;
    following?: boolean;
}

export interface SearchUser {
    pubkey: string;
    picture: string;
}

export class BaseUser {
    pubkey: string;
    name: string;
    constructor(pubkey: string, name: string) {
        this.pubkey = pubkey;
        this.name = name;
    }
}

export function dbUserToUser(dbUser: DBUser): User {
    const kind0Content: Kind0Content = {
        name: dbUser.name,
        username: dbUser.username,
        displayName: dbUser.displayName,
        website: dbUser.website,
        about: dbUser.about,
        picture: dbUser.picture,
        banner: dbUser.banner,
        lud06: dbUser.lud06,
        lud16: dbUser.lud16,
        nip05: dbUser.nip05,
    };
    return new User(
        kind0Content,
        Number(dbUser.createdAt),
        dbUser.pubkey,
        dbUser.following
    );
}

/*
    Preprocesses a kind0 message into a User class to be nicely accessible
*/
export class User {
    name: string = '';
    username: string = '';
    displayName: string = '';
    website: string = '';
    about: string = '';
    aboutHTML: string;
    picture: string = '';
    banner: string = '';
    lud06: string = '';
    lud16: string = '';
    nip05: string = '';
    pubkey: string;
    npub: string;
    createdAt: number;
    apiKey: string;
    following: boolean = false;
    constructor(
        kind0: Kind0Content,
        createdAt: number,
        pubkey: string,
        following?: boolean
    ) {
        this.pubkey = pubkey;
        this.npub = nip19.npubEncode(this.pubkey);
        this.name = kind0.name || '';
        this.username = kind0.username || '';
        this.displayName =
            kind0.displayName || this.name || this.username || this.npub;
        this.website = this.getClickableWebsite(kind0.website || '');
        const fake = {
            reply: undefined,
            root: undefined,
            mentions: [],
            profiles: [],
        };
        this.about = kind0.about || '';
        this.aboutHTML = new Content(
            1,
            kind0.about || '',
            fake,
            true
        ).getParsedContent();
        this.picture =
            kind0.picture || '/images/avatars/avatar-placeholder.png';
        this.banner = kind0.banner || '';
        this.lud06 = kind0.lud06 || '';
        this.lud16 = kind0.lud16 || '';
        this.nip05 = kind0.nip05 || '';
        this.createdAt = createdAt;
        this.cachePubkeyDisplayName();
        this.apiKey = 'LIVDSRZULELA'; // TODO;
        if (following) {
            this.setFollowing(true);
        }
    }

    getClickableWebsite(link: string) {
        if (link === '') return link;
        if (link.startsWith('http://') || link.startsWith('https://')) {
            return link;
        }
        return `http://${link}`;
    }

    cachePubkeyDisplayName() {
        localStorage.setItem(`${this.pubkey}`, this.displayName);
    }

    setLightningInfo(lud06: string, lud16: string) {
        // decode one into the other and vice versa if only has one
    }

    setFollowing(following: boolean) {
        this.following = following;
    }
}
