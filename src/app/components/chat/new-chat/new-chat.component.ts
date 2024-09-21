import { Router } from '@angular/router';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { ChatService } from 'app/components/chat/chat.service';
import { Contact } from 'app/components/chat/chat.types';
import { catchError, Subject, takeUntil, throwError } from 'rxjs';

@Component({
    selector: 'chat-new-chat',
    templateUrl: './new-chat.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
})
export class NewChatComponent implements OnInit, OnDestroy {
    @Input() drawer: MatDrawer;
    contacts: Contact[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _chatService: ChatService, private router: Router) {}

    ngOnInit(): void {
        this._chatService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) => {
                this.contacts = contacts;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    openChat(contact: Contact): void {
        this._chatService.getChatById(contact.pubKey).pipe(

            catchError((error) => {
                console.error(error);
                const parentUrl = this.router.url.split('/').slice(0, -1).join('/');
                this.router.navigateByUrl(parentUrl);
                return throwError(error);
            })
        ).subscribe();

        this.drawer.close();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
