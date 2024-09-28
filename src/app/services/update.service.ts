import { Injectable, NgZone } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { BehaviorSubject, Subscription, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewVersionCheckerService {
    private newVersionAvailableSubject = new BehaviorSubject<boolean>(false);
    isNewVersionAvailable$ = this.newVersionAvailableSubject.asObservable();
    private newVersionSubscription?: Subscription;
    private intervalSource = interval(15 * 60 * 1000);
    private intervalSubscription?: Subscription;

    constructor(
        private swUpdate: SwUpdate,
        private zone: NgZone,
    ) {
        this.checkForUpdateOnLoad();
        this.checkForUpdateOnInterval();
    }

    applyUpdate(): void {
        this.swUpdate
            .activateUpdate()
            .then(() => document.location.reload())
            .catch((error) => console.error('Failed to apply updates:', error));
    }

    private checkForUpdateOnInterval(): void {
        this.unsubscribeInterval();

        if (!this.swUpdate.isEnabled) {
            console.log('Service worker updates are disabled.');
            return;
        }

        this.zone.runOutsideAngular(() => {
            this.intervalSubscription = this.intervalSource.subscribe(async () => {
                try {
                    const updateAvailable = await this.swUpdate.checkForUpdate();
                    console.log(updateAvailable ? 'A new version is available.' : 'Already on the latest version.');
                    if (updateAvailable) {
                        this.newVersionAvailableSubject.next(true);
                    }
                } catch (error) {
                    console.error('Failed to check for updates:', error);
                }
            });
        });
    }

    private checkForUpdateOnLoad(): void {
        this.unsubscribeNewVersion();

        if (!this.swUpdate.isEnabled) {
            console.log('Service worker updates are disabled for this app.');
            return;
        }

        this.newVersionSubscription = this.swUpdate.versionUpdates.subscribe((evt: VersionEvent) => {
            console.log('New version update event:', evt);
            switch (evt.type) {
                case 'VERSION_DETECTED':
                    console.log(`Downloading new app version: ${evt.version.hash}`);
                    break;
                case 'VERSION_READY':
                    console.log(`New app version is ready for use: ${evt.latestVersion.hash}`);
                    this.newVersionAvailableSubject.next(true);
                    break;
                case 'VERSION_INSTALLATION_FAILED':
                    console.error(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
                    break;
                default:
                    console.log('Unknown version event type:', evt.type);
            }
        });

        console.log('Subscribed to new version updates.');
    }


    private unsubscribeInterval(): void {
        if (this.intervalSubscription) {
            this.intervalSubscription.unsubscribe();
        }
    }

    private unsubscribeNewVersion(): void {
        if (this.newVersionSubscription) {
            this.newVersionSubscription.unsubscribe();
        }
    }
}
