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

import { Subject, takeUntil } from 'rxjs';
import { ContactInfoComponent } from '../contact-info/contact-info.component';
import { Chat } from 'app/layout/common/quick-chat/quick-chat.types';
import { ChatService } from '../chat.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { AngorConfigService } from '@angor/services/config';
import { GifDialogComponent } from 'app/shared/gif/gif-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
    recognition: any;
    finalTranscript: string = '';
    isListening: boolean = false;
    userEdited: boolean = false;


    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _chatService: ChatService,
        private _angorMediaWatcherService: AngorMediaWatcherService,
        private _ngZone: NgZone,
        private _angorConfigService: AngorConfigService,
        public dialog: MatDialog
    ) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
          console.error('Speech recognition is not supported in this browser.');
          return;
        }
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.setupRecognitionEvents();
    }



    openGifDialog(): void {
      const dialogRef = this.dialog.open(GifDialogComponent, {
        width: '600px',
        maxHeight: '80vh',
        data: { apiKey: 'LIVDSRZULELA' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const messageContent = result

          if (messageContent) {

            this.messageInput.nativeElement.value = '';
            this._chatService.sendPrivateMessage(messageContent)
                .then(() => {
                    this.messageInput.nativeElement.value = '';
                    this.finalTranscript = '';
                })
                .catch((error) => {
                    console.error('Failed to send message:', error);
                });
            this.finalTranscript = '';
            this.userEdited = false;
        }


        }
      });
    }


    ngOnInit(): void {
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


    parseContent(content: string): string {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return content.replace(urlRegex, (url) => {
          if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
            return `<img src="${url}" alt="Image" width="100%" style="max-width: 100%; border-radius: 5px;">`;
          } else if (url.match(/\.(mp4|webm)$/) != null) {
            return `<video controls width="100%" style="max-width: 100%; border-radius: 5px;"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>`;
          } else if (url.match(/(youtu\.be\/|youtube\.com\/watch\?v=)/)) {
            let videoId = url.split('v=')[1] || url.split('youtu.be/')[1];
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
              videoId = videoId.substring(0, ampersandPosition);
            }
            return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
          } else {
            return `<a href="${url}" target="_blank" style="color: #007bff;">${url}</a>`;
          }
        }).replace(/\n/g, '<br>');
      }


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


    setupRecognitionEvents(): void {
        this.recognition.onresult = (event: any) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    this.finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }


            if (!this.userEdited) {
                this.messageInput.nativeElement.value = this.finalTranscript + interimTranscript;
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error detected: ', event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };
    }


    toggleSpeechRecognition(): void {
        this.finalTranscript = '';
        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        } else {
            this.recognition.start();
            this.isListening = true;
            this.userEdited = false;
        }
    }


    handleUserInput(event: Event): void {
        this.userEdited = true;
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

    toggleMuteNotifications(): void {

        this.chat.muted = !this.chat.muted;


        this._chatService.updateChat(this.chat.id, this.chat).subscribe();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }


    detectSystemTheme() {
        const darkSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkMode = darkSchemeMedia.matches;

        darkSchemeMedia.addEventListener('change', (event) => {
            this.darkMode = event.matches;
        });
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    sendMessage(): void {
        const messageContent = this.messageInput.nativeElement.value.trim();

         if (messageContent) {

            this.messageInput.nativeElement.value = '';
            this._chatService.sendPrivateMessage(messageContent)
                .then(() => {
                    this.messageInput.nativeElement.value = '';
                    this.finalTranscript = '';
                })
                .catch((error) => {
                    console.error('Failed to send message:', error);
                });
            this.finalTranscript = '';
            this.userEdited = false;
        }
    }

    addEmoji(event: any) {
        this.messageInput.nativeElement.value += event.emoji.native;
        this.showEmojiPicker = false;
    }

    toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }

}
