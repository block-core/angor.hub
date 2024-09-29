import { Injectable } from '@angular/core';
import { Filter, NostrEvent } from 'nostr-tools';
import { RelayService } from './relay.service';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocialService {

    private followersSubject = new Subject<NostrEvent>();
    private followingSubject = new Subject<NostrEvent>();

    constructor(
        private relayService: RelayService
    ) {}

    getFollowersObservable(): Observable<NostrEvent> {
        return this.followersSubject.asObservable();
    }

    getFollowingObservable(): Observable<NostrEvent> {
        return this.followingSubject.asObservable();
    }

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
                        following.push( tag[1]  );
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
}
