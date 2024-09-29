import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ViewEncapsulation,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AngorCardComponent } from '@angor/components/card';
import { SignerService } from 'app/services/signer.service';
import { MetadataService } from 'app/services/metadata.service';
import { Subject, takeUntil } from 'rxjs';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SocialService } from 'app/services/social.service';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        RouterLink,
        AngorCardComponent,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        MatDividerModule,
        MatTooltipModule,
        NgClass,
        CommonModule
    ],
})
export class ProfileComponent implements OnInit, OnDestroy {
    isLoading: boolean = true;
    errorMessage: string | null = null;
    metadata: any;
    currentUserMetadata: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private userPubKey;
    private routePubKey;
    followers: any[] = [];
    following: any[] = [];
    allPublicKeys: string[] = [];
    suggestions: { pubkey: string, metadata: any }[] = [];
    isCurrentUserProfile: Boolean;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _metadataService: MetadataService,
        private _signerService: SignerService,
        private _indexedDBService: IndexedDBService,
        private _sanitizer: DomSanitizer,
        private _route: ActivatedRoute,
        private _socialService: SocialService,

    ) { }

    ngOnInit(): void {


        this._route.paramMap.subscribe((params) => {
            this.routePubKey = params.get('pubkey');
            this.userPubKey = this._signerService.getPublicKey();

            if (this.routePubKey) {
                this.loadProfile(this.routePubKey);
            } else {
                this.loadProfile(this.userPubKey);
            }

            this.loadCurrentUserProfile();
        });

        this._indexedDBService.getMetadataStream()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedMetadata) => {
                if (updatedMetadata && updatedMetadata.pubkey === this.userPubKey) {
                    this.currentUserMetadata = updatedMetadata.metadata;
                    this._changeDetectorRef.detectChanges();
                }
            });
        if (this.routePubKey) {
            this._indexedDBService.getMetadataStream()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((updatedMetadata) => {
                    if (updatedMetadata && updatedMetadata.pubkey === this.routePubKey) {
                        this.metadata = updatedMetadata.metadata;
                        this._changeDetectorRef.detectChanges();
                    }
                });
        }


        this._socialService.getFollowersObservable()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((event) => {
                this.followers.push(event.pubkey);
                this._changeDetectorRef.detectChanges();
            });

        this._socialService.getFollowingObservable()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((event) => {
                const tags = event.tags.filter((tag) => tag[0] === 'p');
                tags.forEach((tag) => {
                    this.following.push({ nostrPubKey: tag[1] });
                });
                this._changeDetectorRef.detectChanges();
            });

        this.updateSuggestionList();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private async loadProfile(publicKey: string): Promise<void> {
        this.isLoading = true;
        this.errorMessage = null;

        this.metadata = null;
        this.followers = [];
        this.following = [];
        this._changeDetectorRef.detectChanges();

        if (!publicKey) {
            this.errorMessage = 'No public key found. Please log in again.';
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();
            return;
        }

        try {
            const metadata = await this._metadataService.fetchMetadataWithCache(publicKey);
            if (metadata) {
                this.metadata = metadata;
                this._changeDetectorRef.detectChanges();
            }
            await this._socialService.getFollowers(publicKey);
            await this._socialService.getFollowing(publicKey);

            this._metadataService.getMetadataStream()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((updatedMetadata) => {
                    if (updatedMetadata && updatedMetadata.pubkey === publicKey) {
                        this.metadata = updatedMetadata;
                        this._changeDetectorRef.detectChanges();
                    }
                });

        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.errorMessage = 'Failed to load profile data. Please try again later.';
            this._changeDetectorRef.detectChanges();
        } finally {
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();
        }
    }



    private async loadCurrentUserProfile(): Promise<void> {
        try {
            this.currentUserMetadata = null;

            this.userPubKey = this._signerService.getPublicKey();
            const currentUserMetadata = await this._metadataService.fetchMetadataWithCache(this.userPubKey);
            if (currentUserMetadata) {
                this.currentUserMetadata = currentUserMetadata;

                this._changeDetectorRef.detectChanges();
            }
            this._metadataService.getMetadataStream()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((updatedMetadata) => {
                    if (updatedMetadata && updatedMetadata.pubkey === this.userPubKey) {
                        this.currentUserMetadata = updatedMetadata;
                        this._changeDetectorRef.detectChanges();
                    }
                });
        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.errorMessage = 'Failed to load profile data. Please try again later.';
            this._changeDetectorRef.detectChanges();
        } finally {
            this._changeDetectorRef.detectChanges();
        }
    }

    private updateSuggestionList(): void {
        this._indexedDBService.getSuggestionUsers().then((suggestions) => {
            this.suggestions = suggestions;

            this._changeDetectorRef.detectChanges();
        }).catch((error) => {
            console.error('Error updating suggestion list:', error);
        });
    }

    getSafeUrl(url: string): SafeUrl {
        return this._sanitizer.bypassSecurityTrustUrl(url);
    }
}
