import { Injectable } from '@angular/core';
import { Filter, NostrEvent } from 'nostr-tools';
import { Subject, Observable } from 'rxjs';
import { RelayService } from './relay.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private notificationSubject = new Subject<NostrEvent>();

    constructor(
        private relayService: RelayService
    ) { }

    getNotificationObservable(): Observable<NostrEvent> {
        return this.notificationSubject.asObservable();
    }

    async subscribeToNotifications(pubkey: string): Promise<void> {
        await this.relayService.ensureConnectedRelays();
        const pool = this.relayService.getPool();
        const connectedRelays = this.relayService.getConnectedRelays();

        if (connectedRelays.length === 0) {
            throw new Error('No connected relays');
        }

        const filter: Filter = {
            kinds: [1, 3, 4, 9735], // 1: Text Note, 3: Follow, 4: Encrypted DM, 9735: Zap
            '#p': [pubkey], // Filtering events related to the user's public key
            limit: 50
        };

        return new Promise((resolve) => {
            const sub = pool.subscribeMany(connectedRelays, [filter], {
                onevent: (event: NostrEvent) => {
                    if (this.isNotificationEvent(event, pubkey)) {
                        const eventTimestamp = event.created_at * 1000;
                        const eventDate = new Date(eventTimestamp);
                        const formattedDate = eventDate.toLocaleString();

                        // Log the event kind and details to the console
                        console.log(`Received event kind: ${event.kind}, at ${formattedDate}`);

                        if (event.kind === 4) {
                            event.content = `Sent a private message at ${formattedDate}.`;
                            console.log('Private Message Event:', event);
                        } else if (event.kind === 1) {
                            event.content = `Mentioned you in an event at ${formattedDate}.`;
                            console.log('Mention Event:', event);
                        } else if (event.kind === 9735) {
                            console.log('Zap Event:', event);
                        } else if (event.kind === 3) {
                            console.log('New Follower Event:', event);
                        }

                        this.notificationSubject.next(event);
                    }
                },
                oneose() {
                    sub.close();
                    resolve();
                }
            });
        });
    }


    private isNotificationEvent(event: NostrEvent, pubkey: string): boolean {
        return event.tags.some(tag => tag[0] === 'p' && tag[1] === pubkey);
    }
}
