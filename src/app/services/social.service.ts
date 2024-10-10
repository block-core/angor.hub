import { Injectable } from '@angular/core';
import { Event, Filter, NostrEvent, UnsignedEvent } from 'nostr-tools';
import { Observable, Subject } from 'rxjs';
import { RelayService } from './relay.service';
import { SignerService } from './signer.service';

@Injectable({
    providedIn: 'root',
})
export class SocialService {
    private followersSubject = new Subject<NostrEvent>();
    private followingSubject = new Subject<NostrEvent>();

    constructor(
        private relayService: RelayService,
        private signerService: SignerService
    ) {}

    getFollowersObservable(): Observable<NostrEvent> {
        return this.followersSubject.asObservable();
    }

    getFollowingObservable(): Observable<NostrEvent> {
        return this.followingSubject.asObservable();
    }

    // Fetch followers
    async getFollowers(pubkey: string): Promise<any[]> {
        await this.relayService.ensureConnectedRelays();
        const pool = this.relayService.getPool();
        const connectedRelays = this.relayService.getConnectedRelays();

        if (connectedRelays.length === 0) {
            throw new Error('No connected relays');
        }

        const filters: Filter[] = [{ kinds: [3], '#p': [pubkey] }];
        const followers: any[] = [];

        return new Promise((resolve) => {
            const sub = pool.subscribeMany(connectedRelays, filters, {
                onevent: (event: NostrEvent) => {
                    followers.push(event);
                    this.followersSubject.next(event);
                },
                oneose() {
                    sub.close();
                    resolve(followers);
                },
            });
        });
    }

    // Fetch who the user is following
    async getFollowing(pubkey: string): Promise<any[]> {
        await this.relayService.ensureConnectedRelays();
        const pool = this.relayService.getPool();
        const connectedRelays = this.relayService.getConnectedRelays();

        if (connectedRelays.length === 0) {
            throw new Error('No connected relays');
        }

        const filters: Filter[] = [{ kinds: [3], authors: [pubkey] }];
        const following: any[] = [];

        return new Promise((resolve) => {
            const sub = pool.subscribeMany(connectedRelays, filters, {
                onevent: (event: NostrEvent) => {
                    const tags = event.tags.filter((tag) => tag[0] === 'p');
                    tags.forEach((tag) => {
                        following.push(tag[1]);
                        this.followingSubject.next(event);
                    });
                },
                oneose() {
                    sub.close();
                    resolve(following);
                },
            });
        });
    }

    // Follow a user
    async follow(pubkeyToFollow: string): Promise<void> {
        await this.relayService.ensureConnectedRelays();
        const pool = this.relayService.getPool();
        const currentFollowing = this.getFollowingList();
        if (currentFollowing.includes(pubkeyToFollow)) {
            console.log(`Already following ${pubkeyToFollow}`);
            return;
        }

        // Add the user to the following list
        const newFollowingList = [...currentFollowing, pubkeyToFollow];
        this.setFollowingList(newFollowingList);

        const unsignedEvent: UnsignedEvent =
            this.signerService.getUnsignedEvent(
                3,
                newFollowingList.map((f) => ['p', f]),
                ''
            );

        // Check if using Nostr extension
        const isUsingExtension = await this.signerService.isUsingExtension();
        let signedEvent: Event;

        if (isUsingExtension) {
            // Sign using Nostr extension
            signedEvent =
                await this.signerService.signEventWithExtension(unsignedEvent);
        } else {
            // Sign using private key
            const secretKey = await this.signerService.getDecryptedSecretKey();
            if (!secretKey) {
                throw new Error('Secret key is missing. Unable to follow.');
            }
            signedEvent = this.signerService.getSignedEvent(
                unsignedEvent,
                secretKey
            );
        }

        // Publish the signed follow event
        this.relayService.publishEventToRelays(signedEvent);
        console.log(`Now following ${pubkeyToFollow}`);
    }

    // Unfollow a user
    async unfollow(pubkeyToUnfollow: string): Promise<void> {
        await this.relayService.ensureConnectedRelays();
        const currentFollowing = this.getFollowingList();
        if (!currentFollowing.includes(pubkeyToUnfollow)) {
            console.log(`Not following ${pubkeyToUnfollow}`);
            return;
        }

        // Remove the user from the following list
        const updatedFollowingList = currentFollowing.filter(
            (pubkey) => pubkey !== pubkeyToUnfollow
        );
        this.setFollowingList(updatedFollowingList);

        const unsignedEvent: UnsignedEvent =
            this.signerService.getUnsignedEvent(
                3,
                updatedFollowingList.map((f) => ['p', f]),
                ''
            );

        // Check if using Nostr extension
        const isUsingExtension = await this.signerService.isUsingExtension();
        let signedEvent: Event;

        if (isUsingExtension) {
            // Sign using Nostr extension
            signedEvent =
                await this.signerService.signEventWithExtension(unsignedEvent);
        } else {
            // Sign using private key
            const secretKey = await this.signerService.getDecryptedSecretKey();
            if (!secretKey) {
                throw new Error('Secret key is missing. Unable to unfollow.');
            }
            signedEvent = this.signerService.getSignedEvent(
                unsignedEvent,
                secretKey
            );
        }

        // Publish the signed unfollow event
        this.relayService.publishEventToRelays(signedEvent);
        console.log(`Unfollowed ${pubkeyToUnfollow}`);
    }

    // Retrieve following list as tags for publishing follow/unfollow events
    getFollowingListAsTags(): string[][] {
        const following = this.getFollowingList();
        const tags: string[][] = [];

        const relays = this.relayService.getConnectedRelays();

        following.forEach((f) => {
            relays.forEach((relay) => {
                tags.push(['p', f, relay, localStorage.getItem(`${f}`) || '']);
            });
        });

        return tags;
    }

    setFollowingListFromTags(tags: string[][]): void {
        const following: string[] = [];
        tags.forEach((t) => {
            following.push(t[1]);
        });
        this.setFollowingList(following);
    }

    setFollowingList(following: string[]): void {
        const followingSet = Array.from(new Set(following));
        const newFollowingList = followingSet.filter((s) => s).join(',');
        localStorage.setItem('following', newFollowingList);
    }

    getFollowingList(): string[] {
        const followingRaw = localStorage.getItem('following');
        if (followingRaw === null || followingRaw === '') {
            return [];
        }
        const following = followingRaw.split(',');
        return following.filter((value) => /[a-f0-9]{64}/.test(value));
    }
}
