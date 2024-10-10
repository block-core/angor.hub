import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    MatFormField,
    MatFormFieldModule,
    MatLabel,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SettingsIndexerComponent } from 'app/components/settings/indexer/indexer.component';
import { SettingsNetworkComponent } from 'app/components/settings/network/network.component';
import { SettingsNotificationsComponent } from 'app/components/settings/notifications/notifications.component';
import { SettingsProfileComponent } from 'app/components/settings/profile/profile.component';
import { SettingsRelayComponent } from 'app/components/settings/relay/relay.component';
import { SettingsSecurityComponent } from 'app/components/settings/security/security.component';
import { GifService } from 'app/services/gif.service';

@Component({
    selector: 'gif-dialog',
    templateUrl: './gif-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        NgClass,
        SettingsProfileComponent,
        SettingsSecurityComponent,
        SettingsNotificationsComponent,
        SettingsRelayComponent,
        SettingsNetworkComponent,
        SettingsIndexerComponent,
        FormsModule,
        MatOption,
        MatLabel,
        MatFormField,
        ReactiveFormsModule,
        CommonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
    ],
    styles: [
        `
            .full-width {
                width: 100%;
            }

            .results-container {
                max-height: 300px;

                overflow-y: auto;
                overflow-x: hidden;
            }

            .gif-preview {
                transition: transform 0.2s;
            }

            .gif-preview:hover {
                transform: scale(1.1);
            }
        `,
    ],
})
export class GifDialogComponent {
    gifSearch: string = '';
    gifsFound: string[] = [];

    constructor(
        private gifService: GifService,
        public dialogRef: MatDialogRef<GifDialogComponent>,
        private cdr: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    searchGif() {
        if (!this.gifSearch || this.gifSearch.trim() === '') {
            console.error('Search term is empty.');
            return;
        }

        if (this.data.apiKey) {
            this.gifService
                .getTopGifs(this.gifSearch, this.data.apiKey)
                .subscribe(
                    (response) => {
                        this.gifsFound = response.results.map(
                            (gif) => gif.media[0].gif.url
                        );
                        this.cdr.detectChanges();
                    },
                    (error) => {
                        console.error('Error fetching GIFs:', error);
                    }
                );
        } else {
            console.error('API key is missing.');
        }
    }

    selectGif(gifUrl: string) {
        this.dialogRef.close(gifUrl);
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
