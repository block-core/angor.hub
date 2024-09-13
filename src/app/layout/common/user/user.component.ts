import { AngorConfig, AngorConfigService, Scheme, Theme, Themes } from '@angor/services/config';
import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    standalone: true,
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        NgClass,
        MatDividerModule,
    ],
})
export class UserComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    user: User;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    config: AngorConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;
     /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private _angorConfigService: AngorConfigService

    ) {}

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to user changes
        this.user = {
            id: '1',
            name: 'Test User',
            email: 'testuser@example.com',
            avatar: '/images/avatars/male-06.jpg',
            status: 'online'
        };

            this._angorConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: AngorConfig) => {
                localStorage.setItem('angorConfig', JSON.stringify(config));

                this.config = config;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void {
        // Return if user is not available
        if (!this.user) {
            return;
        }

        // Update the user
        this._userService
            .update({
                ...this.user,
                status,
            })
            .subscribe();
    }

    /**
     * Sign out
     */
    signOut(): void {
        this._router.navigate(['/logout']);
    }

        /**
     * Set the layout on the config
     *
     * @param layout
     */
        setLayout(layout: string): void {
            // Clear the 'layout' query param to allow layout changes
            this._router
                .navigate([], {
                    queryParams: {
                        layout: null,
                    },
                    queryParamsHandling: 'merge',
                })
                .then(() => {
                    // Set the config
                    this._angorConfigService.config = { layout };
                });
        }

        /**
         * Set the scheme on the config
         *
         * @param scheme
         */
        setScheme(scheme: Scheme): void {
            this._angorConfigService.config = { scheme };
        }

        /**
         * Set the theme on the config
         *
         * @param theme
         */
        setTheme(theme: Theme): void {
            this._angorConfigService.config = { theme };
        }
}
