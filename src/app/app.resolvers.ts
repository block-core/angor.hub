import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { forkJoin } from 'rxjs';

/**
 * Resolver function to initialize application data
 * It makes multiple API calls and waits for all to finish
 */
export const initialDataResolver = () => {
    const navigationService = inject(NavigationService);
    const quickChatService = inject(QuickChatService);

    // Combine API calls into a single observable
    return forkJoin([
        navigationService.get(), // Fetch navigation data
        //  quickChatService.getChats(),     // Fetch chat data
    ]);
};
