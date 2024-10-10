import { AngorCardComponent } from '@angor/components/card';
import { AngorConfigService } from '@angor/services/config';
import { AngorConfirmationService } from '@angor/services/confirmation';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { bech32 } from '@scure/base';
import { QRCodeModule } from 'angularx-qrcode';
import { PaginatedEventService } from 'app/services/event.service';
import { IndexedDBService } from 'app/services/indexed-db.service';
import { LightningService } from 'app/services/lightning.service';
import { MetadataService } from 'app/services/metadata.service';
import { SignerService } from 'app/services/signer.service';
import { SocialService } from 'app/services/social.service';
import { SafeUrlPipe } from 'app/shared/pipes/safe-url.pipe';
import { Paginator } from 'app/shared/utils';
import { LightningInvoice, LightningResponse, Post } from 'app/types/post';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NostrEvent } from 'nostr-tools';
import { Subject, takeUntil } from 'rxjs';
import { EventListComponent } from '../event-list/event-list.component';
import { ReceiveDialogComponent } from './zap/receive-dialog/receive-dialog.component';
import { SendDialogComponent } from './zap/send-dialog/send-dialog.component';

interface Chip {
    color?: string;
    selected?: string;
    name: string;
}

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
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
        CommonModule,
        FormsModule,
        QRCodeModule,
        PickerComponent,
        MatSlideToggle,

        SafeUrlPipe,
        MatProgressSpinnerModule,
        InfiniteScrollModule,
        EventListComponent,
    ],
})
export class ProfileComponent implements OnInit, OnDestroy {
    @ViewChild('eventInput', { static: false }) eventInput: ElementRef;
    @ViewChild('commentInput') commentInput: ElementRef;

    darkMode: boolean = false;
    isLoading: boolean = true;
    errorMessage: string | null = null;
    metadata: any;
    currentUserMetadata: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public currentUserPubKey: string;
    public routePubKey;
    followers: any[] = [];
    following: any[] = [];
    allPublicKeys: string[] = [];
    suggestions: { pubkey: string; metadata: any }[] = [];
    isCurrentUserProfile: Boolean = false;
    isFollowing = false;

    showEmojiPicker = false;
    showCommentEmojiPicker = false;
    lightningResponse: LightningResponse | null = null;
    lightningInvoice: LightningInvoice | null = null;
    sats: string;
    paymentInvoice: string = '';
    invoiceAmount: string = '?';
    isLiked = false;
    isPreview = false;
    posts: Post[] = [];
    likes: any[] = [];

    paginator: Paginator;

    myLikes: NostrEvent[] = [];
    myLikedNoteIds: string[] = [];

    isLoadingPosts: boolean = true;
    noEventsMessage: string = '';
    loadingTimeout: any;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _metadataService: MetadataService,
        private _signerService: SignerService,
        private _indexedDBService: IndexedDBService,
        private _sanitizer: DomSanitizer,
        private _route: ActivatedRoute,
        private _socialService: SocialService,
        private snackBar: MatSnackBar,
        private lightning: LightningService,
        private _dialog: MatDialog,
        private _angorConfigService: AngorConfigService,
        private _angorConfirmationService: AngorConfirmationService,
        private eventService: PaginatedEventService
    ) {
        let baseTimeDiff = 12000;
        let since = 0;

        this.paginator = new Paginator(0, since, (baseTimeDiff = baseTimeDiff));
    }

    ngOnInit(): void {
        this._angorConfigService.config$.subscribe((config) => {
            if (config.scheme === 'auto') {
                this.detectSystemTheme();
            } else {
                this.darkMode = config.scheme === 'dark';
            }
        });
        this._route.paramMap.subscribe((params) => {
            const routePubKey = params.get('pubkey');
            this.routePubKey = routePubKey;
            const currentUserPubKey = this._signerService.getPublicKey();
            this.currentUserPubKey = currentUserPubKey;
            if (routePubKey || currentUserPubKey) {
                this.isCurrentUserProfile = routePubKey === currentUserPubKey;
            }

            this.routePubKey = routePubKey || currentUserPubKey;
            this.loadProfile(this.routePubKey);
            if (!routePubKey) {
                this.isCurrentUserProfile = true;
            }
            this.loadCurrentUserProfile();

            this.updateSuggestionList();
        });

        this._indexedDBService
            .getMetadataStream()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedMetadata) => {
                if (
                    updatedMetadata &&
                    updatedMetadata.pubkey === this.currentUserPubKey
                ) {
                    this.currentUserMetadata = updatedMetadata.metadata;
                    this._changeDetectorRef.detectChanges();
                }
            });
        if (this.routePubKey) {
            this._indexedDBService
                .getMetadataStream()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((updatedMetadata) => {
                    if (
                        updatedMetadata &&
                        updatedMetadata.pubkey === this.routePubKey
                    ) {
                        this.metadata = updatedMetadata.metadata;
                        this._changeDetectorRef.detectChanges();
                    }
                });
        }

        this._socialService
            .getFollowersObservable()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((event) => {
                this.followers.push(event.pubkey);
                this._changeDetectorRef.detectChanges();
            });

        this._socialService
            .getFollowingObservable()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((event) => {
                const tags = event.tags.filter((tag) => tag[0] === 'p');
                tags.forEach((tag) => {
                    this.following.push({ nostrPubKey: tag[1] });
                });
                this._changeDetectorRef.detectChanges();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    async onScroll() {}

    async loadProfile(publicKey: string): Promise<void> {
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
            const userMetadata =
                await this._metadataService.fetchMetadataWithCache(publicKey);
            if (userMetadata) {
                this.metadata = userMetadata;
                this._changeDetectorRef.detectChanges();
            }

            await this._socialService.getFollowers(publicKey);
            const currentUserPubKey = this._signerService.getPublicKey();
            this.isFollowing = this.followers.includes(currentUserPubKey);

            await this._socialService.getFollowing(publicKey);

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

    private async loadCurrentUserProfile(): Promise<void> {
        try {
            this.currentUserMetadata = null;

            this.currentUserPubKey = this._signerService.getPublicKey();
            const currentUserMetadata =
                await this._metadataService.fetchMetadataWithCache(
                    this.currentUserPubKey
                );
            if (currentUserMetadata) {
                this.currentUserMetadata = currentUserMetadata;

                this._changeDetectorRef.detectChanges();
            }
            this._metadataService
                .getMetadataStream()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((updatedMetadata) => {
                    if (
                        updatedMetadata &&
                        updatedMetadata.pubkey === this.currentUserPubKey
                    ) {
                        this.currentUserMetadata = updatedMetadata;
                        this._changeDetectorRef.detectChanges();
                    }
                });
        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.errorMessage =
                'Failed to load profile data. Please try again later.';
            this._changeDetectorRef.detectChanges();
        } finally {
            this._changeDetectorRef.detectChanges();
        }
    }

    private updateSuggestionList(): void {
        this._indexedDBService
            .getSuggestionUsers()
            .then((suggestions) => {
                this.suggestions = suggestions;

                this._changeDetectorRef.detectChanges();
            })
            .catch((error) => {
                console.error('Error updating suggestion list:', error);
            });
    }

    getSafeUrl(url: string): SafeUrl {
        return this._sanitizer.bypassSecurityTrustUrl(url);
    }

    async toggleFollow(): Promise<void> {
        try {
            const userPubKey = this._signerService.getPublicKey();
            const routePubKey = this.routePubKey || this.currentUserPubKey;

            if (!routePubKey || !userPubKey) {
                console.error('Public key missing. Unable to toggle follow.');
                return;
            }

            if (this.isFollowing) {
                await this._socialService.unfollow(routePubKey);
                console.log(`Unfollowed ${routePubKey}`);

                this.followers = this.followers.filter(
                    (pubkey) => pubkey !== userPubKey
                );
            } else {
                await this._socialService.follow(routePubKey);
                console.log(`Followed ${routePubKey}`);

                this.followers.push(userPubKey);
            }

            this.isFollowing = !this.isFollowing;

            this._changeDetectorRef.detectChanges();
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        }
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 1300 });
    }

    getLightningInfo() {
        let lightningAddress = '';
        if (this.metadata?.lud06) {
            const { words } = bech32.decode(this.metadata.lud06, 5000);
            const data = new Uint8Array(bech32.fromWords(words));
            lightningAddress = new TextDecoder().decode(Uint8Array.from(data));
        } else if (this.metadata?.lud16?.toLowerCase().startsWith('lnurl')) {
            const { words } = bech32.decode(this.metadata.lud16, 5000);
            const data = new Uint8Array(bech32.fromWords(words));
            lightningAddress = new TextDecoder().decode(Uint8Array.from(data));
        } else if (this.metadata?.lud16) {
            lightningAddress = this.lightning.getLightningAddress(
                this.metadata.lud16
            );
        }
        if (lightningAddress !== '') {
            this.lightning
                .getLightning(lightningAddress)
                .subscribe((response) => {
                    this.lightningResponse = response;
                    if (this.lightningResponse.status === 'Failed') {
                        this.openSnackBar(
                            'Failed to lookup lightning address',
                            'dismiss'
                        );
                    } else if (this.lightningResponse.callback) {
                        this.openZapDialog();
                    } else {
                        this.openSnackBar(
                            "couldn't find user's lightning address",
                            'dismiss'
                        );
                    }
                });
        } else {
            this.openSnackBar('No lightning address found', 'dismiss');
        }
    }

    async zap() {
        if (this.metadata && (this.metadata.lud06 || this.metadata.lud16)) {
            this.getLightningInfo();
        } else {
            this.openSnackBar("user can't receive zaps", 'dismiss');
        }
    }

    openZapDialog(): void {
        this._dialog.open(SendDialogComponent, {
            width: '405px',
            maxHeight: '90vh',
            data: this.metadata,
        });
    }

    openReceiveZapDialog(): void {
        this._dialog.open(ReceiveDialogComponent, {
            width: '405px',
            maxHeight: '90vh',
            data: this.metadata,
        });
    }

    toggleLike() {
        this.isLiked = !this.isLiked;

        if (this.isLiked) {
            setTimeout(() => {
                this.isLiked = false;
                this.isLiked = true;
            }, 300);
        }
    }

    addEmoji(event: any) {
        this.eventInput.nativeElement.value += event.emoji.native;
        this.showEmojiPicker = false;
    }

    toggleEmojiPicker() {
        this.showCommentEmojiPicker = false;
        this.showEmojiPicker = !this.showEmojiPicker;
    }

    addEmojiTocomment(event: any) {
        this.commentInput.nativeElement.value += event.emoji.native;
        this.showCommentEmojiPicker = false;
    }

    toggleCommentEmojiPicker() {
        this.showEmojiPicker = false;
        this.showCommentEmojiPicker = !this.showCommentEmojiPicker;
    }

    detectSystemTheme() {
        const darkSchemeMedia = window.matchMedia(
            '(prefers-color-scheme: dark)'
        );
        this.darkMode = darkSchemeMedia.matches;

        darkSchemeMedia.addEventListener('change', (event) => {
            this.darkMode = event.matches;
        });
    }

    openConfirmationDialog(): void {
        const dialogRef = this._angorConfirmationService.open({
            title: 'Share Event',
            message:
                'Are you sure you want to share this event on your profile? <span class="font-medium">This action is permanent and cannot be undone.</span>',
            icon: {
                show: true,
                name: 'heroicons_solid:share',
                color: 'primary',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Yes, Share',
                    color: 'primary',
                },
                cancel: {
                    show: true,
                    label: 'Cancel',
                },
            },
            dismissible: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log(result);
        });
    }

    togglePreview() {
        this.isPreview = !this.isPreview;
    }

    sendEvent() {
        if (this.eventInput.nativeElement.value != '') {
            console.error('Event input is empty.');
            this.eventService
                .sendTextEvent(this.eventInput.nativeElement.value)
                .then(() => {
                    this._changeDetectorRef.markForCheck();
                })
                .catch((error) => {
                    console.error('Failed to send Event:', error);
                });
        }
    }
}
