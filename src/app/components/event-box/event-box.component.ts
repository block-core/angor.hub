import { AngorCardComponent } from '@angor/components/card';
import { AngorConfigService } from '@angor/services/config';
import { AngorConfirmationService } from '@angor/services/confirmation';
 import { NgClass, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
 import { MatButtonModule } from '@angular/material/button';
 import { MatDividerModule } from '@angular/material/divider';
 import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EventService } from 'app/services/event.service';
import { Post, Zap } from 'app/types/post';


@Component({
  selector: 'app-event-box',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'app-event-box',
  standalone: true,
  imports: [
    AngorCardComponent,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule,
    NgClass,
    CommonModule,
    PickerComponent
  ],
  templateUrl: './event-box.component.html',
  styleUrls: ['./event-box.component.scss'],

 })
export class EventBoxComponent {
   @ViewChild('commentInput') commentInput: ElementRef;
    @Input() user?: any;
    @Input() isLiked: boolean = false;
    @Input() root?: Post;
    @Input() post?: Post;
    @Input() zaps?: Zap[];
    @Input() zapsCount?: number;
    @Input() inPostDetail?: boolean;
    @Input() likes?: number;
    isCurrentUserProfile:boolean = true;
    showCommentEmojiPicker = false;
    darkMode: boolean = false;
    isLoading: boolean = true;
    errorMessage: string | null = null;
    metadata: any;

    constructor(
         private _angorConfigService: AngorConfigService,
        private _angorConfirmationService: AngorConfirmationService,
        private snackBar: MatSnackBar,
        private _eventService : EventService

    ) { }

    ngOnInit(): void {
        this._angorConfigService.config$.subscribe((config) => {
            if (config.scheme === 'auto') {
                this.detectSystemTheme();
            } else {
                this.darkMode = config.scheme === 'dark';
            }
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
    likePost(event :Post) {
        this._eventService.sendLikeEvent(event);
        this.post.setPostLikedByMe(true);
        if (this.likes === undefined) {
            this.likes = 0;
        }
        this.likes += 1;
        this.openSnackBar("Reaction Sent", "dismiss");
    }



    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 1300 });
    }

    addEmojiTocomment(event: any) {
        this.commentInput.nativeElement.value += event.emoji.native;
        this.showCommentEmojiPicker = false;
    }

    toggleCommentEmojiPicker1() {
        console.log('toggleCommentEmojiPicker1 called')
         this.showCommentEmojiPicker = !this.showCommentEmojiPicker;
    }

    detectSystemTheme() {
        const darkSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkMode = darkSchemeMedia.matches;

        darkSchemeMedia.addEventListener('change', (event) => {
            this.darkMode = event.matches;
        });
    }



    openConfirmationDialog(): void {
        // Open the dialog and save the reference of it
        const dialogRef = this._angorConfirmationService.open(
            {
                "title": "Share Event",
                "message": "Are you sure you want to share this event on your profile? <span class=\"font-medium\">This action is permanent and cannot be undone.</span>",
                "icon": {
                    "show": true,
                    "name": "heroicons_solid:share",
                    "color": "primary"
                },
                "actions": {
                    "confirm": {
                        "show": true,
                        "label": "Yes, Share",
                        "color": "primary"
                    },
                    "cancel": {
                        "show": true,
                        "label": "Cancel"
                    }
                },
                "dismissible": true
            }

        );

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            console.log(result);
        });
    }
}


