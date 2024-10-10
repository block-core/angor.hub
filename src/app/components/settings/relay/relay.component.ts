import { CommonModule, TitleCasePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    NgZone,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RelayService } from 'app/services/relay.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'settings-relay',
    templateUrl: './relay.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        TitleCasePipe,
        CommonModule,
        FormsModule,
    ],
})
export class SettingsRelayComponent implements OnInit {
    relays: any[] = [];
    accessOptions: any[] = [];
    newRelayUrl: string = '';
    private subscriptions: Subscription = new Subscription();

    constructor(
        private relayService: RelayService,
        private cdr: ChangeDetectorRef,
        private zone: NgZone,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        // Subscribe to relays observable
        this.subscriptions.add(
            this.relayService.getRelays().subscribe((relays) => {
                this.zone.run(() => {
                    this.relays = relays;
                    this.cdr.markForCheck(); // Mark the component for check
                });
            })
        );

        // Setup access roles
        this.accessOptions = [
            {
                label: 'Read',
                value: 'read',
                description:
                    'Reads only, does not write, unless explicitly specified on publish action.',
            },
            {
                label: 'Write',
                value: 'write',
                description:
                    'Writes your events, profile, and other metadata updates. Connects on-demand.',
            },
            {
                label: 'Read and Write',
                value: 'read-write',
                description:
                    'Reads and writes events, profiles, and other metadata. Always connected.',
            },
        ];
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    addRelay() {
        if (this.newRelayUrl) {
            this.relayService.addRelay(this.newRelayUrl);
            this.newRelayUrl = '';
        }
    }

    updateRelayAccess(relay: any) {
        console.log('Relay Access Updated:', relay.url, relay.accessType);
        this.relayService.updateRelayAccessType(relay.url, relay.accessType);
    }

    removeRelay(url: string) {
        this.relayService.removeRelay(url);
    }

    trackByFn(index: number, item: any): any {
        return item.url || index;
    }

    getRelayStatus(relay: any): string {
        return relay.connected ? 'Connected' : 'Disconnected';
    }

    getRelayStatusClass(relay: any): string {
        return relay.connected ? 'text-green-700' : 'text-red-700';
    }

    relayFavIcon(url: string): string {
        let safeUrl = url
            .replace('wss://', 'https://')
            .replace('ws://', 'https://');

        return safeUrl + '/favicon.ico';
    }

    getSafeUrl(url: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }
}
