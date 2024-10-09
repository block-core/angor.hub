import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PaginatedEventService } from 'app/services/event.service';
 import { NewEvent } from 'app/types/NewEvent';
import { NostrEvent } from 'nostr-tools';
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
  events$: Observable<NewEvent[]>; // Observable of the events to subscribe to
  isLoading: boolean = false;
  noMoreEvents: boolean = false;

  constructor(private paginatedEventService: PaginatedEventService) {
    this.events$ = this.paginatedEventService.getEventStream(); // Subscribe to the event stream
  }

  ngOnInit(): void {
    this.loadInitialEvents();
    this.paginatedEventService.hasMoreEvents().subscribe(noMore => {
      this.noMoreEvents = noMore;
    });
  }

  // Load initial events when the component initializes
  loadInitialEvents(): void {
    this.isLoading = true;
    const publicKeys = ['5f432a9f39b58ff132fc0a4c8af10d42efd917d8076f68bb7f2f91ed7d4f6a41']; // Replace with the public keys you want to load events for
    this.paginatedEventService.loadMoreEvents(publicKeys).finally(() => {
      this.isLoading = false;
    });
  }

  // Load more events when the user scrolls to the bottom
  loadMoreEvents(): void {
    if (!this.isLoading && !this.noMoreEvents) {
      this.isLoading = true;
      const publicKeys = ['5f432a9f39b58ff132fc0a4c8af10d42efd917d8076f68bb7f2f91ed7d4f6a41']; // Replace with the public keys
      this.paginatedEventService.loadMoreEvents(publicKeys).finally(() => {
        this.isLoading = false;
      });
    }
  }

  // Send a like event
  sendLike(event: NewEvent): void {
    if (!event.likedByMe) {
      this.paginatedEventService.sendLikeEvent(event).then(() => {
        event.likedByMe = true;
        event.likeCount++;
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
