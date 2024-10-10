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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { AgoPipe } from 'app/shared/pipes/ago.pipe';
import { CheckmessagePipe } from 'app/shared/pipes/checkmessage.pipe';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../chat.service';
import { Chat, Profile } from '../chat.types';
import { NewChatComponent } from '../new-chat/new-chat.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
    selector: 'chat-chats',
    templateUrl: './chats.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        NewChatComponent,
        ProfileComponent,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        NgClass,
        RouterLink,
        RouterOutlet,
        AgoPipe,
        CommonModule,
        CheckmessagePipe,
    ],
})
export class ChatsComponent implements OnInit, OnDestroy {
    // Variables to store chat list, filtered chats, user profile, and selected chat
    chats: Chat[] = [];
    filteredChats: Chat[] = [];
    profile: Profile;
    selectedChat: Chat;

    // Drawer management for profile and new chat views
    drawerComponent: 'profile' | 'new-chat';
    drawerOpened: boolean = false;

    // Subject for managing unsubscriptions
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    /**
     * Constructor for ChatsComponent
     * @param _chatService - The service managing chats
     * @param _changeDetectorRef - Reference for change detection in Angular
     */
    constructor(
        private _chatService: ChatService,
        private _changeDetectorRef: ChangeDetectorRef,
        private route: ActivatedRoute
    ) {}

    /**
     * Angular lifecycle hook (ngOnInit) for component initialization.
     * Subscribes to chat list, profile, and selected chat updates, and initializes the chat list subscription.
     */
    ngOnInit(): void {
        // Subscribe to chat updates
        this._chatService.chats$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chats: Chat[]) => {
                this.chats = this.filteredChats = chats;
                this._markForCheck();
            });

        // Subscribe to profile updates
        this._chatService.profile$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((profile: Profile) => {
                this.profile = profile;
                this._markForCheck();
            });

        // Subscribe to selected chat updates
        this._chatService.chat$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chat: Chat) => {
                this.selectedChat = chat;
                this._markForCheck();
            });

        this._chatService.InitSubscribeToChatList();

        const savedChatId = localStorage.getItem('currentChatId');

        if (savedChatId) {
            this._chatService.checkCurrentChatOnPageRefresh(savedChatId);
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from all observables
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Reset the selected chat in the service
        this._chatService.resetChat();
        localStorage.removeItem('currentChatId');
    }

    /**
     * Filters the chat list based on a search query.
     * @param query - The string query to filter chats by name
     */
    filterChats(query: string): void {
        if (!query) {
            this.filteredChats = this.chats;
        } else {
            const lowerCaseQuery = query.toLowerCase();
            this.filteredChats = this.chats.filter((chat) =>
                chat.contact?.name.toLowerCase().includes(lowerCaseQuery)
            );
        }
        this._markForCheck();
    }

    /**
     * Opens the drawer with the New Chat component.
     */
    openNewChat(): void {
        this.drawerComponent = 'new-chat';
        this.drawerOpened = true;
        this._markForCheck();
    }

    /**
     * Opens the drawer with the Profile component.
     */
    openProfile(): void {
        this.drawerComponent = 'profile';
        this.drawerOpened = true;
        this._markForCheck();
    }

    /**
     * TrackBy function to optimize performance when rendering chat items in the template.
     * @param index - The index of the item in the loop
     * @param item - The item (Chat) being tracked
     */
    trackByFn(index: number, item: Chat): string | number {
        return item.id || index;
    }

    /**
     * Marks the component for change detection.
     * This is necessary when using OnPush change detection strategy to manually trigger updates.
     */
    private _markForCheck(): void {
        this._changeDetectorRef.markForCheck();
    }
}
