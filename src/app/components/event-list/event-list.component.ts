import { AngorCardComponent } from '@angor/components/card';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { QRCodeModule } from 'angularx-qrcode';
import { PaginatedEventService } from 'app/services/event.service';
import { SafeUrlPipe } from 'app/shared/pipes/safe-url.pipe';
import { NewEvent } from 'app/types/NewEvent';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-event-list',
    templateUrl: './event-list.component.html',
    styleUrls: ['./event-list.component.scss'],
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
        EventListComponent,],
})
export class EventListComponent implements OnInit {
    @Input() pubkeys: string[] = [];
    @Input() currentUserMetadata :any;
    eventInput

    events$: Observable<NewEvent[]>;
    isLoading: boolean = false;
    noMoreEvents: boolean = false;
    isLiked = false;
    showCommentEmojiPicker = false;

    constructor(
        private paginatedEventService: PaginatedEventService,
        private changeDetectorRef: ChangeDetectorRef,
        private sanitizer: DomSanitizer
    ) {
        this.events$ = this.paginatedEventService.getEventStream();
    }

    ngOnInit(): void {
        // Subscribe to real-time events
        this.paginatedEventService
            .subscribeToEvents(this.pubkeys)
            .then(() => {})
            .catch((error) => {
                console.error('Error subscribing to events:', error);
            });

        // Subscribe to events stream
        this.events$.subscribe((events) => {
            const sortedEvents = events.sort(
                (a, b) => b.createdAt - a.createdAt
            );
            this.changeDetectorRef.markForCheck(); // Trigger change detection
        });

        this.loadInitialEvents();

        this.paginatedEventService.hasMoreEvents().subscribe((noMore) => {
            this.noMoreEvents = noMore;
            this.changeDetectorRef.markForCheck();
        });
    }

    loadInitialEvents(): void {
        if (this.pubkeys.length === 0) {
            console.warn('No pubkeys provided to EventListComponent');
            return;
        }

        this.isLoading = true;
        this.paginatedEventService.loadMoreEvents(this.pubkeys).finally(() => {
            this.isLoading = false;
            this.changeDetectorRef.markForCheck();
        });
    }

    loadMoreEvents(): void {
        if (!this.isLoading && !this.noMoreEvents) {
            this.isLoading = true;
            this.paginatedEventService
                .loadMoreEvents(this.pubkeys)
                .finally(() => {
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();
                });
        }
    }

    getSanitizedContent(content: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    sendLike(event: NewEvent): void {
        if (!event.likedByMe) {
            this.paginatedEventService
                .sendLikeEvent(event)
                .then(() => {
                    event.likedByMe = true;
                    event.likeCount++;
                    this.changeDetectorRef.markForCheck();
                })
                .catch((error) => {
                    console.error('Failed to send like:', error);
                });
        }
    }

    getTimeFromNow(event: NewEvent): string {
        return event.fromNow;
    }

    trackById(index: number, item: NewEvent): string {
        return item.id;
    }

    parseContent(content: string): SafeHtml {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const cleanedContent = content.replace(/["]+/g, '');
        const parsedContent = cleanedContent
            .replace(urlRegex, (url) => {
                if (
                    url.match(/\.(jpeg|jpg|gif|png|bmp|svg|webp|tiff)$/) != null
                ) {
                    return `<img src="${url}" alt="Image" width="100%" class="c-img">`;
                } else if (url.match(/\.(mp4|webm)$/) != null) {
                    return `<video controls width="100%" class="c-video"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>`;
                } else if (url.match(/(youtu\.be\/|youtube\.com\/watch\?v=)/)) {
                    let videoId;
                    if (url.includes('youtu.be/')) {
                        videoId = url.split('youtu.be/')[1];
                    } else if (url.includes('watch?v=')) {
                        const urlParams = new URLSearchParams(
                            url.split('?')[1]
                        );
                        videoId = urlParams.get('v');
                    }
                    return `<iframe width="100%" class="c-video" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                } else {
                    return `<a href="${url}" target="_blank">${url}</a>`;
                }
            })
            .replace(/\n/g, '<br>');

        return this.sanitizer.bypassSecurityTrustHtml(parsedContent);
    }





    toggleLike (event: NewEvent): void {
        this.isLiked = !this.isLiked;

        if (this.isLiked) {
            this.sendLike(event);
            setTimeout(() => {
                this.isLiked = false;
                this.isLiked = true;
            }, 300);
        }
    }

    toggleCommentEmojiPicker() {
         this.showCommentEmojiPicker = !this.showCommentEmojiPicker;
    }


}
