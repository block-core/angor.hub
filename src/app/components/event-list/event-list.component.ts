import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { PaginatedEventService } from 'app/services/event.service';
import { NewEvent } from 'app/types/NewEvent';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule],
})
export class EventListComponent implements OnInit {
  @Input() pubkeys: string[] = []; // Define input for pubkeys

  events$: Observable<NewEvent[]>; // Observable for the event stream
  isLoading: boolean = false;
  noMoreEvents: boolean = false;

  constructor(
    private paginatedEventService: PaginatedEventService,
    private changeDetectorRef: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
    this.events$ = this.paginatedEventService.getEventStream(); // Subscribe to event stream
  }

  ngOnInit(): void {
    // Subscribe to the event stream and update UI when events are received
    this.events$.subscribe(events => {
      // Sort events by creation date, newest first
      const sortedEvents = events.sort((a, b) => b.createdAt - a.createdAt);

      console.log('Received and sorted events:', sortedEvents); // Log the sorted list of events
      this.changeDetectorRef.markForCheck(); // Ensure the UI updates with new events
    });

    // Load initial events on component initialization
    this.loadInitialEvents();

    // Check if there are more events to load
    this.paginatedEventService.hasMoreEvents().subscribe(noMore => {
      this.noMoreEvents = noMore;
      this.changeDetectorRef.markForCheck(); // Update UI when more events are loaded
    });
  }

  // Load initial events when the component initializes
  loadInitialEvents(): void {
    if (this.pubkeys.length === 0) {
      console.warn('No pubkeys provided to EventListComponent');
      return;
    }

    this.isLoading = true;
    this.paginatedEventService.loadMoreEvents(this.pubkeys).finally(() => {
      this.isLoading = false;
      this.changeDetectorRef.markForCheck(); // Ensure the UI updates after loading
    });
  }

  // Load more events when the user scrolls to the bottom
  loadMoreEvents(): void {
    if (!this.isLoading && !this.noMoreEvents) {
      this.isLoading = true;
      this.paginatedEventService.loadMoreEvents(this.pubkeys).finally(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck(); // Update UI after more events are loaded
      });
    }
  }

  // Send a like event
  sendLike(event: NewEvent): void {
    if (!event.likedByMe) {
      this.paginatedEventService.sendLikeEvent(event).then(() => {
        event.likedByMe = true;
        event.likeCount++;
        this.changeDetectorRef.markForCheck(); // Update UI after liking an event
      }).catch(error => {
        console.error('Failed to send like:', error);
      });
    }
  }

  // Utility to display time in a human-readable format (e.g., "5 minutes ago")
  getTimeFromNow(event: NewEvent): string {
    return event.fromNow;
  }
}
