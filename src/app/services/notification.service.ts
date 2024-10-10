import { Injectable } from '@angular/core';
import { Filter, NostrEvent } from 'nostr-tools';
import { BehaviorSubject, Observable } from 'rxjs';
import { RelayService } from './relay.service';

export interface NostrNotification {
    id: string;
    icon?: string;
    image?: string;
    title?: string;
    description?: string;
    time?: Date;
    kind?: number;
    link?: string;
    useRouter?: boolean;
    read?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private notificationSubject = new BehaviorSubject<NostrNotification[]>([]);
    private notificationCount = new BehaviorSubject<number>(0);
    private lastNotificationTimestamp: number | null = null;

    constructor(private relayService: RelayService) {
        this.initializeNotificationData();
    }

    private initializeNotificationData(): void {
        this.notificationCount.next(this.loadCountFromLocalStorage());
        this.lastNotificationTimestamp = this.loadTimestampFromLocalStorage();
    }

    private loadCountFromLocalStorage(): number {
        const storedCount = localStorage.getItem('notificationCount');
        return storedCount ? parseInt(storedCount, 10) : 0;
    }

    private loadTimestampFromLocalStorage(): number | null {
        const storedTimestamp = localStorage.getItem(
            'lastNotificationTimestamp'
        );
        return storedTimestamp ? parseInt(storedTimestamp, 10) : null;
    }

    private saveNotificationData(count: number, timestamp: number): void {
        localStorage.setItem('notificationCount', count.toString());
        localStorage.setItem('lastNotificationTimestamp', timestamp.toString());
    }

    getNotificationObservable(): Observable<NostrNotification[]> {
        return this.notificationSubject.asObservable();
    }

    public getNotificationCount(): Observable<number> {
        return this.notificationCount.asObservable();
    }

    private loadFilterPreferences(): number[] {
        const storedPreferences = localStorage.getItem('notificationSettings');
        return storedPreferences
            ? JSON.parse(storedPreferences)
            : [1, 3, 4, 7, 9735]; // Default to all kinds if not set
    }

    public async subscribeToNotifications(pubkey: string): Promise<void> {
        await this.relayService.ensureConnectedRelays();
        const pool = this.relayService.getPool();
        const connectedRelays = this.relayService.getConnectedRelays();

        if (connectedRelays.length === 0) {
            throw new Error('No connected relays');
        }
        const lastNotificationTimestamp = this.loadTimestampFromLocalStorage();
        const filterPreferences = this.loadFilterPreferences();

        if (filterPreferences.length === 0) {
            filterPreferences.push(1, 3, 4, 7, 9735);
        }

        const filter: Filter = {
            kinds: filterPreferences,
            '#p': [pubkey],
            limit: 50,
            since: lastNotificationTimestamp || undefined,
        };

        return new Promise((resolve) => {
            const sub = pool.subscribeMany(connectedRelays, [filter], {
                onevent: (event: NostrEvent) =>
                    this.handleNotificationEvent(event, pubkey),
                oneose() {
                    resolve();
                },
            });
        });
    }

    private handleNotificationEvent(event: NostrEvent, pubkey: string): void {
        if (this.isNotificationEvent(event, pubkey)) {
            const eventTimestamp = event.created_at * 1000;
            const formattedDate = new Date(eventTimestamp);

            let notificationTitle = '';
            let notificationDescription = '';
            let notificationIcon = '';

            switch (event.kind) {
                case 1:
                    notificationTitle = 'Mention';
                    notificationDescription = `Mentioned you in an event.`;
                    notificationIcon = 'heroicons_outline:at-symbol';
                    break;
                case 4:
                    notificationTitle = 'Private Message';
                    notificationDescription = `Sent a private message.`;
                    notificationIcon = 'heroicons_outline:envelope-open';
                    break;
                case 9735:
                    notificationTitle = 'Zap';
                    notificationDescription = 'Received a zap event.';
                    notificationIcon = 'feather:zap';
                    break;
                case 3:
                    notificationTitle = 'New Follower';
                    notificationDescription = 'You have a new follower.';
                    notificationIcon = 'heroicons_outline:user-plus';
                    break;
                case 7:
                    notificationTitle = 'New Like';
                    notificationDescription = 'You have a new Like.';
                    notificationIcon = 'heroicons_outline:hand-thumb-up';
                    break;
                default:
                    notificationTitle = 'Notification';
                    notificationIcon = 'heroicons_outline:bell';
                    break;
            }

            const notification: NostrNotification = {
                id: event.id,
                icon: notificationIcon,
                title: notificationTitle,
                description: notificationDescription,
                time: formattedDate,
                kind: event.kind,
                read: false,
            };

            const currentNotifications = this.notificationSubject.value;
            const updatedNotifications = [
                notification,
                ...currentNotifications,
            ].slice(0, 50);

            this.notificationSubject.next(updatedNotifications);
            this.incrementNotificationCount(event.created_at);
        }
    }

    private incrementNotificationCount(timestamp: number): void {
        const newCount = this.notificationCount.value + 1;
        this.notificationCount.next(newCount);
        this.saveNotificationData(newCount, timestamp);
    }

    public markAllAsRead(): void {
        const updatedNotifications = this.notificationSubject.value.map(
            (notification) => ({
                ...notification,
                read: true,
            })
        );
        this.notificationSubject.next(updatedNotifications);
        this.notificationCount.next(0);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        this.saveNotificationData(0, currentTimestamp);
    }

    private isNotificationEvent(event: NostrEvent, pubkey: string): boolean {
        return event.tags.some((tag) => tag[0] === 'p' && tag[1] === pubkey);
    }
}
