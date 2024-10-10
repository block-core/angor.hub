import { AngorDrawerComponent } from '@angor/components/drawer';
import {
    AngorConfig,
    AngorConfigService,
    Scheme,
    Theme,
    Themes,
} from '@angor/services/config';
import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styles: [
        `
            settings {
                position: static;
                display: block;
                flex: none;
                width: auto;
            }

            @media (screen and min-width: 1280px) {
                empty-layout + settings .settings-cog {
                    right: 0 !important;
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        AngorDrawerComponent,
        MatButtonModule,
        NgClass,
        MatTooltipModule,
    ],
})
export class SettingsComponent implements OnInit, OnDestroy {
    config: AngorConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _router: Router,
        private _angorConfigService: AngorConfigService
    ) {}

    ngOnInit(): void {
        // Subscribe to config changes
        this._angorConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: AngorConfig) => {
                localStorage.setItem('angorConfig', JSON.stringify(config));

                this.config = config;
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

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

    setScheme(scheme: Scheme): void {
        this._angorConfigService.config = { scheme };
    }

    setTheme(theme: Theme): void {
        this._angorConfigService.config = { theme };
    }
}
