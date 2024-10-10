import { AngorMediaWatcherService } from '@angor/services/media-watcher';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { SignerService } from 'app/services/signer.service';
import { Subject, takeUntil } from 'rxjs';
import { SettingsIndexerComponent } from './indexer/indexer.component';
import { SettingsNetworkComponent } from './network/network.component';
import { SettingsNotificationsComponent } from './notifications/notifications.component';
import { SettingsProfileComponent } from './profile/profile.component';
import { SettingsRelayComponent } from './relay/relay.component';
import { SettingsSecurityComponent } from './security/security.component';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        NgClass,
        SettingsProfileComponent,
        SettingsSecurityComponent,
        SettingsNotificationsComponent,
        SettingsRelayComponent,
        SettingsNetworkComponent,
        SettingsIndexerComponent,
    ],
})
export class SettingsComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened = true;
    panels = [
        {
            id: 'relay',
            icon: 'heroicons_outline:server',
            title: 'Relay',
            description:
                'Manage and configure your existing relays and update their access roles and permissions.',
        },
        {
            id: 'network',
            icon: 'heroicons_outline:globe-alt',
            title: 'Network',
            description:
                'Switch between mainnet and testnet for different Bitcoin network configurations.',
        },
        {
            id: 'indexer',
            icon: 'heroicons_outline:chart-bar',
            title: 'Indexer',
            description:
                'Add, remove, and manage your indexers, including setting the primary indexer.',
        },
        {
            id: 'profile',
            icon: 'heroicons_outline:user',
            title: 'Profile',
            description:
                'Update your personal profile, manage your account details, and modify your private information.',
        },
        {
            id: 'notifications',
            icon: 'heroicons_outline:bell',
            title: 'Notifications',
            description:
                'Control when and how you’ll be notified across various communication channels.',
        },
        {
            id: 'security',
            icon: 'heroicons_outline:shield-check',
            title: 'Password Management',
            description:
                'Manage your password and decryption settings, including saving passwords for future decrypting sensitive information.',
        },
    ];

    selectedPanel = 'relay';
    selectPanel(panelId: string): void {
        this.selectedPanel = panelId;
        this.router.navigate(['settings', panelId], { replaceUrl: true });
    }

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _angorMediaWatcherService: AngorMediaWatcherService,
        private _signerService: SignerService,
        private _route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this._route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id && this.panels.some((panel) => panel.id === id)) {
                this.selectedPanel = id;
            } else {
                this.selectedPanel = 'relay';
            }
        });

        const securityPanel = {
            id: 'security',
            icon: 'heroicons_outline:shield-check',
            title: 'Password Management',
            description:
                'Manage your password and decryption settings, including saving passwords for future decrypting sensitive information.',
        };

        if (!this._signerService.isUsingSecretKey()) {
            this.panels = this.panels.filter(
                (panel) => panel.id !== 'security'
            );
            console.log('Extension used, security panel removed');
        } else {
            const panelExists = this.panels.some(
                (panel) => panel.id === 'security'
            );
            if (!panelExists) {
                this.panels.push(securityPanel);
                console.log('Extension not used, security panel added');
            }
        }

        this._changeDetectorRef.markForCheck();

        this._angorMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.drawerMode = matchingAliases.includes('lg')
                    ? 'side'
                    : 'over';
                this.drawerOpened = this.drawerMode === 'side';
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    goToPanel(panel: string): void {
        this.selectedPanel = panel;
        this.router.navigate(['settings', panel], { replaceUrl: true });
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }

    getPanelInfo(id: string): any {
        return this.panels.find((panel) => panel.id === id);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
