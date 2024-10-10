import { decode } from '@gandlaf21/bolt11-decode';
import { MetadataService } from 'app/services/metadata.service';
import { humantime } from 'app/shared/utils';
import dayjs from 'dayjs';
import { Event, nip10, nip19 } from 'nostr-tools';
import { NIP10Result } from 'nostr-tools/nip10';

export interface TextWrap {
    text: string;
    cssClass?: string;
    addLink?: string;
    npub?: string;
    nevent?: string;
    hashtag?: string;
}

export interface LightningResponse {
    allowsNostr?: boolean;
    nostrPubkey?: string;
    callback?: string; // The URL from LN SERVICE which will accept the pay request parameters
    commentAllowed?: number;
    maxSendable?: number; // Max millisatoshi amount LN SERVICE is willing to receive
    minSendable?: number; // Min millisatoshi amount LN SERVICE is willing to receive, can not be less than 1 or more than `maxSendable`
    metadata?: string; // Metadata json which must be presented as raw string here, this is required to pass signature verification at a later step
    tag?: string;
    status?: string;
    reason?: string;
}

export interface LightningInvoice {
    pr: string;
    routes?: string[];
}

export interface ZapRequest {
    kind: number;
    content: string;
    tags: string[][];
    pubkey: string;
    created_at: number;
    id: string;
    sig: string;
}

export class Zap {
    id: string;
    kind: number;
    walletPubkey: string;
    walletNpub: string;
    createdAt: number;
    date: Date;
    sig: string;
    tags: string[][];
    username: string = '';
    picture: string = '';
    receiverPubKey: string;
    receiverNpub: string;
    receiverEventId: string;
    senderPubkey: string = '';
    senderNpub: string = '';
    senderMessage: string = '';
    bolt11: string;
    preImage: string;
    description: Event | null;
    fromNow: string = '';
    content: string = '';
    satAmount: number;
    constructor(
        id: string,
        kind: number,
        pubkey: string,
        created_at: number,
        sig: string,
        tags: string[][]
    ) {
        this.id = id;
        this.kind = kind;
        this.walletPubkey = pubkey;
        this.setUsername(this.walletPubkey);
        this.setPicture(this.walletPubkey);
        this.walletNpub = nip19.npubEncode(this.walletPubkey);
        this.sig = sig;
        this.tags = tags;
        this.receiverPubKey = this.getUserPubkey();
        this.receiverNpub = nip19.npubEncode(this.receiverPubKey);
        this.receiverEventId = this.getEventId();
        this.bolt11 = this.getBolt11();
        this.satAmount = this.getBolt11Amount();
        this.preImage = this.getPreImage();
        this.description = this.getDescription();
        this.setSender();
        this.createdAt = created_at;
        this.date = new Date(this.createdAt * 1000);
        this.setFromNow();
        this.setContent();
    }

    getUserPubkey() {
        const p: string = 'p';
        for (let tag of this.tags) {
            if (tag[0] === p) {
                return tag[1];
            }
        }
        return '';
    }

    getEventId() {
        const e: string = 'e';
        for (let tag of this.tags) {
            if (tag[0] === e) {
                return tag[1];
            }
        }
        return '';
    }

    getBolt11() {
        const bolt: string = 'bolt11';
        for (let tag of this.tags) {
            if (tag[0] === bolt) {
                return tag[1];
            }
        }
        return '';
    }

    getPreImage() {
        const pi: string = 'preimage';
        for (let tag of this.tags) {
            if (tag[0] === pi) {
                return tag[1];
            }
        }
        return '';
    }

    getDescription(): Event | null {
        const desc: string = 'description';
        for (let tag of this.tags) {
            if (tag[0] === desc) {
                try {
                    return JSON.parse(tag[1]) as Event;
                } catch (e) {
                    console.log(
                        `couldn't parse zap receipt description: ${tag}`
                    );
                    return null;
                }
            }
        }
        return null;
    }

    getBolt11Amount() {
        if (this.bolt11) {
            const decodedInvoice = decode(this.bolt11);
            for (let s of decodedInvoice.sections) {
                if (s.name === 'amount') {
                    return Number(s.value) / 1000;
                }
            }
        }
        return 0;
    }

    setContent() {
        if (this.description) {
            let content = "<div class='zap-generated-content'>";
            content =
                content +
                `<div><strong><span style="color: orange; font-size: 20px;">${this.satAmount} sats </span>ZAP!</strong><span class="zap-time"> ${humantime(this.createdAt)}</span></div>`;
            content =
                content +
                `<p><strong> To: </strong><span>nostr:${this.receiverNpub}</span></p><p><strong> From: </strong><span>nostr:${this.senderNpub}</span></p>`;
            if (this.receiverEventId) {
                content =
                    content +
                    `<p><strong>Note: </strong>nostr:${nip19.neventEncode({ id: this.receiverEventId })}</p>`;
            }
            if (this.senderMessage) {
                content =
                    content +
                    `<p><strong>Message: </strong>${this.senderMessage}</p>`;
            }
            content = content + '</div>';
            let nip10Result = nip10.parse(this.description);
            this.content = new Content(
                this.kind,
                content,
                nip10Result
            ).getParsedContent();
        } else {
            this.content = '<p>Anon Zap</p>';
        }
    }

    setSender() {
        if (this.description) {
            this.senderMessage = this.description.content;
            this.senderPubkey = this.description.pubkey;
            this.senderNpub = nip19.npubEncode(this.senderPubkey);
        }
    }

    setFromNow(): void {
        this.fromNow = dayjs(this.date).fromNow();
    }

    setUsername(pubkey: string): void {
        this.username = localStorage.getItem(`${pubkey}_name`) || pubkey; // TODO
    }

    setPicture(pubkey: string): void {
        this.picture =
            localStorage.getItem(`${pubkey}_img`) ||
            '/images/avatars/avatar-placeholder.png';
    }
}

export function isYoutubeVideo(url: string): boolean {
    var p =
        /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/gi;
    return url.match(p) ? true : false;
}

export class Content {
    kind: number;
    content: string;
    nip10Result: NIP10Result;
    addHash: boolean;
    constructor(
        kind: number,
        content: string,
        nip10Result: NIP10Result,
        addHash: boolean = true
    ) {
        this.kind = kind;
        this.content = content;
        this.nip10Result = nip10Result;
        this.addHash = addHash;
    }

    getParsedContent(ignoreNIP10: boolean = false): string {
        if (this.kind === 6) {
            this.content = this.reposted();
        }
        if (!ignoreNIP10) {
            this.content = this.nip08Replace(this.content);
        }
        this.content = this.parseLightningInvoice(this.content);
        this.content = this.hashtagContent(this.content);
        this.content = this.cashtagContent(this.content);
        this.content = this.linkify(this.content);
        this.content = this.replaceNostrThing(this.content);
        return this.content;
    }

    parseCreateNote() {
        this.content = this.hashtagContent(this.content);
        this.content = this.cashtagContent(this.content);
        this.content = this.styleUsername(this.content);
        return this.content;
    }

    getNevent(ep: nip19.EventPointer): string {
        return nip19.neventEncode(ep);
    }

    hasEventPointer(content: string): boolean {
        if (content.includes('nostr:')) {
            return true;
        }
        return false;
    }

    ellipsis(value: string): string {
        if (value.length < 40) return value;
        let section: number = value.length / 8;
        let finalSection: number = value.length - section;
        return (
            value.substring(0, section) + ':' + value.substring(finalSection)
        );
    }

    reposted(): string {
        if (this.nip10Result.root) {
            return `nostr:${this.getNevent(this.nip10Result.root)}`;
        }
        return '<repost but malformed>';
    }

    wrapTextInSpan(textWrap: TextWrap): string {
        if (textWrap.cssClass === undefined) {
            textWrap.cssClass = 'hashtag';
        }
        if (textWrap.npub) {
            return `<span class="${textWrap.cssClass}" data-npub=${textWrap.npub}>${textWrap.text}</span>`;
        } else if (textWrap.nevent) {
            return `<span class="${textWrap.cssClass}" data-nevent=${textWrap.nevent}>${textWrap.text}</span>`;
        } else if (textWrap.hashtag) {
            return `<span class="${textWrap.cssClass}" data-hashtag=${textWrap.hashtag}>${textWrap.text}</span>`;
        } else if (this.addHash && textWrap.addLink) {
            // this fixes an issue in user about not redirecting properly
            textWrap.addLink = textWrap.addLink.replace('href="', 'href="/#/');
            return `<a class="${textWrap.cssClass}" ${textWrap.addLink}>${textWrap.text}</a>`;
        }
        return `<span class="${textWrap.cssClass}">${textWrap.text}</span>`;
    }

    getNpub(pubkey: string): string {
        if (pubkey.startsWith('npub')) {
            return pubkey;
        }
        return nip19.npubEncode(pubkey);
    }

    getUsername(pubkey: string): string {
        if (pubkey.startsWith('npub')) {
            pubkey = nip19.decode(pubkey).data.toString();
        }
        return `@${localStorage.getItem(`${pubkey}`) || this.getNpub(pubkey)}`;
    }

    nip08Replace(content: string): string {
        let userTags: string[] = content.match(/#\[\d+\]/gm) || [];
        // is this condition right?
        if (this.nip10Result.profiles.length !== userTags.length) {
            return content;
        }
        for (let i in userTags) {
            let userPubkey = this.nip10Result.profiles[i].pubkey;
            let npub = this.getNpub(userPubkey);
            let username = this.getUsername(userPubkey);
            let textWrap: TextWrap = {
                text: username,
                addLink: `href="/users/${npub}"`,
            };
            content = content.replace(
                userTags[i],
                this.wrapTextInSpan(textWrap)
            );
        }
        return content;
    }

    parseLightningInvoice(content: string): string {
        let invoices: string[] =
            content.match(/(lightning:|lnbc)[a-z0-9]+/gm) || [];
        for (let invoice of invoices) {
            try {
                content = content.replace(
                    invoice,
                    this.getReplacementInvoiceHtml(invoice)
                );
            } catch (e) {
                console.log('failed to decode lightning invoice');
            }
        }
        return content;
    }

    getInvoiceAmount(invoice: string) {
        if (invoice) {
            const decodedInvoice = decode(invoice);
            for (let s of decodedInvoice.sections) {
                if (s.name === 'amount') {
                    return Number(s.value) / 1000;
                }
            }
        }
        return '';
    }

    getReplacementInvoiceHtml(invoice: string) {
        const amount = this.getInvoiceAmount(invoice);
        const r = `<div class="lightning-invoice"><span class="lightning-title">Lightning Invoice: ${amount} sats</span><mat-divider></mat-divider><p>${invoice}<br><br><button class="button-17" role="button">pay</button></p></div>`;
        return r;
    }

    hashtagContent(content: string): string {
        let hashtagRegex = /#\w+\S/gm;
        return content.replace(hashtagRegex, function (tag) {
            let textWrap: TextWrap = {
                text: tag,
                cssClass: 'hashtag',
                hashtag: `${tag.substring(1)}`,
            };
            return `<span class="${textWrap.cssClass}" data-hashtag=${textWrap.hashtag}>${textWrap.text}</span>`;
        });
    }

    cashtagContent(content: string): string {
        let cashtagRegex = /\$\w+\S/gm;
        return content.replace(cashtagRegex, function (tag) {
            let textWrap: TextWrap = {
                text: tag,
                cssClass: 'hashtag',
                hashtag: `${tag.substring(1)}`,
            };
            return `<span class="${textWrap.cssClass}" data-hashtag=${textWrap.hashtag}>${textWrap.text}</span>`;
        });
    }

    styleUsername(content: string): string {
        let usernameRegex = /@\w+/gm;
        return content.replace(usernameRegex, function (name) {
            let textWrap: TextWrap = { text: name, cssClass: 'hashtag' };
            return `<a class="${textWrap.cssClass}" ${textWrap.addLink}>${textWrap.text}</a>`;
        });
    }

    linkify(content: string): string {
        // TODO: could be improved
        let urlRegex =
            /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        return content.replace(urlRegex, function (url) {
            // improve this?
            if (
                url.toLowerCase().endsWith('.png') ||
                url.toLowerCase().endsWith('.jpg') ||
                url.toLowerCase().endsWith('.jpeg') ||
                url.toLowerCase().endsWith('.webp') ||
                url.toLowerCase().endsWith('.gif') ||
                url.toLowerCase().endsWith('.gifv')
            ) {
                return `<p class='post-image'><img src="${url}" /></p>`;
            }
            if (
                url.toLowerCase().endsWith('mp4') ||
                url.toLowerCase().endsWith('mov')
            ) {
                return `<p class='post-video'><video controls><source src="${url}#t=0.1" type="video/mp4"></video></p>`;
            }
            if (isYoutubeVideo(url)) {
                // kinda hacky but works
                if (url.includes('youtu.be')) {
                    url = url.replace('youtu.be/', 'youtube.com/watch?v=');
                }
                url = url.replace('watch?v=', 'embed/');
                return `<p><iframe width="100%" height="350px" src="${url}"></iframe></p>`;
            }
            return `<p><a href="${url}" target="_blank">${url}</a></p>`;
        });
    }

    encodeNoteAsEvent(note: string): string {
        let decodedNote = nip19.decode(note).data.toString();
        let eventP: nip19.EventPointer = { id: decodedNote };
        return nip19.neventEncode(eventP);
    }

    npubFromNProfile(nprofile: string): string {
        const decodedNProfile: nip19.ProfilePointer = nip19.decode(nprofile)
            .data as nip19.ProfilePointer;
        return nip19.npubEncode(decodedNProfile.pubkey);
    }

    replaceNostrThing(content: string) {
        if (!this.hasEventPointer(content)) {
            return content;
        }
        let matches = content.match(/nostr:[a-z0-9]+/gm) || [];
        for (let m in matches) {
            let match = matches[m];
            try {
                if (match.startsWith('nostr:npub')) {
                    let npub = match.substring(6);
                    let username = this.getUsername(npub);
                    let textWrap: TextWrap = {
                        text: this.ellipsis(username),
                        npub: npub,
                        cssClass: 'user-at',
                    };
                    let htmlSpan = this.wrapTextInSpan(textWrap);
                    content = content.replace(match, htmlSpan);
                }
                if (match.startsWith('nostr:nevent')) {
                    let nevent = match.substring(6);
                    let textWrap: TextWrap = {
                        text: this.ellipsis(nevent),
                        nevent: nevent,
                    };
                    content = content.replace(
                        match,
                        this.wrapTextInSpan(textWrap)
                    );
                }
                if (match.startsWith('nostr:note')) {
                    let note = match.substring(6);
                    let textWrap: TextWrap = {
                        text: this.ellipsis(note),
                        nevent: this.encodeNoteAsEvent(note),
                    };
                    content = content.replace(
                        match,
                        this.wrapTextInSpan(textWrap)
                    );
                }
                if (match.startsWith('nostr:nprofile')) {
                    const nprofile = match.substring(6);
                    const npub = this.npubFromNProfile(nprofile);
                    let textWrap: TextWrap = {
                        text: this.ellipsis(npub),
                        npub: npub,
                        cssClass: 'user-at',
                    };
                    content = content.replace(
                        match,
                        this.wrapTextInSpan(textWrap)
                    );
                }
                if (match.startsWith('nostr:naddr')) {
                    // these are editable posts i think means long form
                    // so we will link to habla.news for now
                    // https://habla.news/a/naddr1qqxnzdesxg6rzdp4xu6nzwpnqgsf03c2gsmx5ef4c9zmxvlew04gdh7u94afnknp33qvv3c94kvwxgsrqsqqqa280a30ar
                    const naddr = match.substring(6);
                    //let textWrap: TextWrap = {text: this.ellipsis(naddr), nevent: this.encodeNAddrAsEvent(naddr)}
                    content = content.replace(
                        naddr,
                        `https://habla.news/a/${naddr}`
                    );
                    content = this.linkify(content);
                }
            } catch (e) {
                console.log(e);
            }
        }
        return content;
    }
}

export class Post {
    kind: number;
    content: string;
    pubkey: string;
    npub: string;
    noteId: string;
    createdAt: number;
    nip10Result: NIP10Result;
    date: Date;
    fromNow: string = '';
    username: string = '';
    picture: string = '';
    replyingTo: string[] = [];
    mentions: string[] = [];
    nostrNoteId: string;
    nostrEventId: string;
    replyCount: number;
    likeCount: number;
    isAReply: boolean = false;
    repostingPubkey: string;
    likedByMe: boolean = false;
    likers: any;
    shareCount: any;
    commentCount: any;
    comments: any;
    id: any;

    constructor(
        kind: number,
        pubkey: string,
        content: string,
        noteId: string,
        createdAt: number,
        nip10Result: NIP10Result,
        repostingPubkey: string,
        private metadataService: MetadataService // Inject MetadataService
    ) {
        this.kind = kind;
        this.pubkey = pubkey;
        this.npub = nip19.npubEncode(this.pubkey);
        this.noteId = noteId;
        this.nip10Result = nip10Result;
        this.createdAt = createdAt;
        this.date = new Date(this.createdAt * 1000);
        this.setFromNow();
        this.content = new Content(
            kind,
            content,
            nip10Result
        ).getParsedContent();
        this.nostrNoteId = nip19.noteEncode(this.noteId);
        this.nostrEventId = nip19.neventEncode({ id: this.noteId });
        this.replyCount = 0;
        this.likeCount = 0;
        this.setIsAReply();
        this.repostingPubkey = repostingPubkey;

        // Fetch username and picture using the MetadataService
        this.setUsernameAndPicture(pubkey);
    }

    getAllTags(): string[][] {
        return [
            ['e', this.noteId],
            ['p', this.pubkey],
        ];
    }

    // Fetch metadata for the username and picture
    async setUsernameAndPicture(pubkey: string): Promise<void> {
        try {
            const metadata =
                await this.metadataService.fetchMetadataWithCache(pubkey);
            if (metadata) {
                this.username = metadata.name || this.npub;
                this.picture =
                    metadata.picture ||
                    '/images/avatars/avatar-placeholder.png';
            } else {
                this.username = this.npub;
                this.picture = '/images/avatars/avatar-placeholder.png';
            }
        } catch (error) {
            console.error('Error fetching user metadata:', error);
            this.username = this.npub; // Default to npub if there's an error
            this.picture = '/images/avatars/avatar-placeholder.png'; // Default to a placeholder image
        }
    }

    setReplyCount(count: number): void {
        this.replyCount = count;
    }

    setLikeCount(count: number): void {
        this.likeCount = count;
    }

    setFromNow(): void {
        this.fromNow = dayjs(this.date).fromNow();
    }

    setReplyingTo(): void {
        // Logic to set replying to information based on metadata
    }

    setPostLikedByMe(val: boolean): void {
        this.likedByMe = val;
    }

    setIsAReply(): void {
        if (this.nip10Result.root || this.nip10Result.reply) {
            this.isAReply = true;
        } else {
            this.isAReply = false;
        }
    }
}
