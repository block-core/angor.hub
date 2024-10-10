import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { PaginatedEventService } from 'app/services/event.service';
import { NewEvent } from 'app/types/NewEvent';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

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
    this.paginatedEventService.subscribeToEvents(this.pubkeys).then(() => {
      console.log('Subscribed to real-time events.');
    }).catch(error => {
      console.error('Error subscribing to events:', error);
    });

    // Subscribe to events stream
    this.events$.subscribe(events => {
      const sortedEvents = events.sort((a, b) => b.createdAt - a.createdAt);
      this.changeDetectorRef.markForCheck(); // Trigger change detection
    });

    this.loadInitialEvents();

    this.paginatedEventService.hasMoreEvents().subscribe(noMore => {
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
      this.paginatedEventService.loadMoreEvents(this.pubkeys).finally(() => {
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
      this.paginatedEventService.sendLikeEvent(event).then(() => {
        event.likedByMe = true;
        event.likeCount++;
        this.changeDetectorRef.markForCheck();
      }).catch(error => {
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
}
