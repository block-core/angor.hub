import { Injectable, NgZone } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subscription, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewVersionCheckerService {
    isNewVersionAvailable: boolean = false;
    newVersionSubscription?: Subscription;
    intervalSource = interval(15 * 60 * 1000); // every 15 mins
    intervalSubscription?: Subscription;

    constructor(
        private swUpdate: SwUpdate,
        private zone: NgZone,
    ) {
        this.checkForUpdateOnInterval();
        this.checkForUpdateOnLoad();
    }

    applyUpdate(): void {
        // Reload the page to update to the latest version after the new version is activated
        this.swUpdate
            .activateUpdate()
            .then(() => document.location.reload())
            .catch((error) => console.error('Failed to apply updates:', error));
    }

    checkForUpdateOnInterval(): void {
        this.intervalSubscription?.unsubscribe();
        if (!this.swUpdate.isEnabled) {
            return;
        }

        this.zone.runOutsideAngular(() => {
            this.intervalSubscription = this.intervalSource.subscribe(async () => {
                if (!this.isNewVersionAvailable) {
                    try {
                        this.isNewVersionAvailable = await this.swUpdate.checkForUpdate();
                        console.log(this.isNewVersionAvailable ? 'A new version is available.' : 'Already on the latest version.');
                    } catch (error) {
                        console.error('Failed to check for updates:', error);
                    }
                } else {
                    // Check for updates at interval, which will keep the
                    // browser updating to latest version as long as it's being kept open.
                    await this.swUpdate.checkForUpdate();
                }
            });
        });
    }

    checkForUpdateOnLoad(): void {
        this.newVersionSubscription?.unsubscribe();
        if (!this.swUpdate.isEnabled) {
            console.log('Service worker updates are disabled for this app.');
            return;
        }
        this.newVersionSubscription = this.swUpdate.versionUpdates.subscribe((evt) => {
            console.log('New version update event:');
            console.log(evt);
            switch (evt.type) {
                case 'VERSION_DETECTED':
                    console.log(`Downloading new app version: ${evt.version.hash}`);
                    break;
                case 'VERSION_READY':
                    console.log(`Current app version: ${evt.currentVersion.hash}`);
                    console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
                    this.isNewVersionAvailable = true;
                    break;
                case 'VERSION_INSTALLATION_FAILED':
                    console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
                    break;
            }
        });

        console.log('Subscribed to new version updates.');
    }
}
