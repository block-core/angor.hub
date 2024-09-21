import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink } from '@angular/router';
import { AngorMediaWatcherService } from '@angor/services/media-watcher';
import { ChatService } from 'app/components/chat/chat.service';
import { Chat } from 'app/components/chat/chat.types';
import { ContactInfoComponent } from 'app/components/chat/contact-info/contact-info.component';
import { Subject, takeUntil } from 'rxjs';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { AngorConfigService } from '@angor/services/config';

@Component({
    selector: 'chat-conversation',
    templateUrl: './conversation.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        ContactInfoComponent,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        MatMenuModule,
        NgClass,
        NgTemplateOutlet,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        DatePipe,
        PickerComponent,
        CommonModule
    ],
})
export class ConversationComponent implements OnInit, OnDestroy {
    @ViewChild('messageInput') messageInput: ElementRef;
    chat: Chat;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    showEmojiPicker = false;
    darkMode: boolean = false;


    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _chatService: ChatService,
        private _angorMediaWatcherService: AngorMediaWatcherService,
        private _ngZone: NgZone,
        private _angorConfigService: AngorConfigService
    ) { }

    @HostListener('input')
    @HostListener('ngModelChange')
    private _resizeMessageInput(): void {

        this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {

                this.messageInput.nativeElement.style.height = 'auto';


                this._changeDetectorRef.detectChanges();


                this.messageInput.nativeElement.style.height = `${this.messageInput.nativeElement.scrollHeight}px`;


                this._changeDetectorRef.detectChanges();
            });
        });
    }
    ngOnInit(): void {
        // Listen to config changes to adjust theme based on the scheme
        this._angorConfigService.config$.subscribe((config) => {
            if (config.scheme === 'auto') {
                this.detectSystemTheme();
            } else {
                this.darkMode = config.scheme === 'dark';
            }
        });

        this._chatService.chat$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chat: Chat) => {
                this.chat = chat;


                this._changeDetectorRef.markForCheck();
            });


        this._angorMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }


                this._changeDetectorRef.markForCheck();
            });
    }



    ngOnDestroy(): void {

        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    openContactInfo(): void {

        this.drawerOpened = true;


        this._changeDetectorRef.markForCheck();
    }

    resetChat(): void {
        this._chatService.resetChat();


        this.drawerOpened = false;


        this._changeDetectorRef.markForCheck();
    }
    // Function to detect system theme when scheme is set to 'auto'
    detectSystemTheme() {
        const darkSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkMode = darkSchemeMedia.matches;

        // Listen for changes in system theme preference
        darkSchemeMedia.addEventListener('change', (event) => {
            this.darkMode = event.matches;
        });
    }
    toggleMuteNotifications(): void {

        this.chat.muted = !this.chat.muted;


        this._chatService.updateChat(this.chat.id, this.chat).subscribe();
    }

    sendMessage(): void {
        const messageContent = this.messageInput.nativeElement.value.trim();

        if (!messageContent) {
            console.warn('Cannot send an empty message.');
            return;
        }

        this._chatService.sendPrivateMessage(messageContent)
            .then(() => {
                this.messageInput.nativeElement.value = '';
                console.log('Message sent successfully.');
            })
            .catch((error) => {
                console.error('Failed to send message:', error);
            });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }





    // Function to add the selected emoji to the text
    addEmoji(event: any) {
        this.messageInput.nativeElement.value += event.emoji.native;
        this.showEmojiPicker = false;
    }

    // Toggle emoji picker visibility
    toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }


}
