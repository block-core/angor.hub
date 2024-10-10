import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { ChatComponent } from 'app/components/chat/chat.component';
import { ChatService } from 'app/components/chat/chat.service';
import { ChatsComponent } from 'app/components/chat/chats/chats.component';
import { EmptyConversationComponent } from 'app/components/chat/empty-conversation/empty-conversation.component';
import { catchError, throwError } from 'rxjs';
import { ConversationComponent } from './conversation/conversation.component';

/**
 * Conversation resolver
 *
 * @param route
 * @param state
 */
const conversationResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const chatService = inject(ChatService);
    const router = inject(Router);

    let chatId =
        route.paramMap.get('id') || localStorage.getItem('currentChatId');

    if (!chatId) {
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        router.navigateByUrl(parentUrl);
        return throwError('No chat ID provided');
    }

    localStorage.setItem('currentChatId', chatId);

    return chatService.getChatById(chatId).pipe(
        catchError((error) => {
            console.error('Error fetching conversation:', error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            router.navigateByUrl(parentUrl);
            return throwError(error);
        })
    );
};

export default [
    {
        path: '',
        component: ChatComponent,
        resolve: {
            chats: () => inject(ChatService).getChats(),
            contacts: () => inject(ChatService).getContacts(),
            profile: () => inject(ChatService).getProfile(),
        },
        children: [
            {
                path: '',
                component: ChatsComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: EmptyConversationComponent,
                    },
                    {
                        path: ':id',
                        component: ConversationComponent,
                        resolve: {
                            conversation: conversationResolver,
                        },
                    },
                ],
            },
        ],
    },
] as Routes;
