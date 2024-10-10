import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatedEventService } from 'app/services/event.service';
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
    imports: [CommonModule, InfiniteScrollModule],
})
export class EventListComponent implements OnInit {
    @Input() pubkeys: string[] = [];

    events$: Observable<NewEvent[]>;
    isLoading: boolean = false;
    noMoreEvents: boolean = false;

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
}
