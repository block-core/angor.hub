import {
    AngorConfig,
    AngorConfigService,
    Scheme,
    Theme,
    Themes,
} from '@angor/services/config';
import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { MetadataService } from 'app/services/metadata.service';
import { SignerService } from 'app/services/signer.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        NgClass,
        MatDividerModule,
        CommonModule,
    ],
})
export class UserComponent implements OnInit, OnDestroy {
    user: any;
    isLoading: boolean = true;
    errorMessage: string | null = null;
    metadata: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    config: AngorConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _angorConfigService: AngorConfigService,
        private _metadataService: MetadataService,
        private _signerService: SignerService,
        private _indexedDBService: IndexedDBService,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this.loadUserProfile();
        this._angorConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: AngorConfig) => {
                localStorage.setItem('angorConfig', JSON.stringify(config));
                this.config = config;
                this._changeDetectorRef.detectChanges();
            });
        this.loadUserProfile();

        this._indexedDBService
            .getMetadataStream()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedMetadata) => {
                if (
                    updatedMetadata &&
                    updatedMetadata.pubkey === this.user?.pubkey
                ) {
                    this.metadata = updatedMetadata.metadata;
                    this._changeDetectorRef.detectChanges();
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private async loadUserProfile(): Promise<void> {
        this.isLoading = true;
        this.errorMessage = null;
        const publicKey = this._signerService.getPublicKey();

        if (!publicKey) {
            this.errorMessage = 'No public key found. Please log in again.';
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();
            return;
        }

        this.user = { pubkey: publicKey };

        try {
            const metadata =
                await this._metadataService.fetchMetadataWithCache(publicKey);
            if (metadata) {
                this.metadata = metadata;
                this._changeDetectorRef.detectChanges();
            }

            this._metadataService
                .getMetadataStream()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((updatedMetadata) => {
                    if (
                        updatedMetadata &&
                        updatedMetadata.pubkey === publicKey
                    ) {
                        this.metadata = updatedMetadata;
                        this._changeDetectorRef.detectChanges();
                    }
                });
        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.errorMessage =
                'Failed to load profile data. Please try again later.';
            this._changeDetectorRef.detectChanges();
        } finally {
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();
        }
    }

    logout(): void {
        this._router.navigate(['/logout']);
    }

    profile(): void {
        this._router.navigate(['/profile']);
    }

    setLayout(layout: string): void {
        this._angorConfigService.config = { layout };
        this._changeDetectorRef.detectChanges();
    }

    setScheme(scheme: Scheme): void {
        this._angorConfigService.config = { scheme };
        this._changeDetectorRef.detectChanges();
    }

    setTheme(theme: Theme): void {
        this._angorConfigService.config = { theme };
        this._changeDetectorRef.detectChanges();
    }

    getSafeUrl(url: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }
}
