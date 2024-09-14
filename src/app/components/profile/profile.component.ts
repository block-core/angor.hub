import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AngorCardComponent } from '@angor/components/card';
import { AngorConfigService } from '@angor/services/config';
import { NostrService } from 'app/services/nostr.service';
import { SignerService } from 'app/services/signer.service';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        RouterLink,
        AngorCardComponent,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        MatDividerModule,
        MatTooltipModule,
        NgClass,
        CommonModule
    ],
})
export class ProfileComponent {
    user: any;
    isLoading: boolean = true;
    errorMessage: string | null = null;
    metadata: any;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _angorConfigService: AngorConfigService,
        private _nostrService: NostrService,
        private _signerService: SignerService
    ) { }
    ngOnInit(): void {
        this.loadUserProfile();
    }
    private async loadUserProfile(): Promise<void> {
        this.isLoading = true;
        this.errorMessage = null;
        const publicKey = this._signerService.getPublicKey();

        if (!publicKey) {
            this.errorMessage = 'No public key found. Please log in again.';
            this.isLoading = false;
            return;
        }

        try {
            const metadata = await this._nostrService.fetchMetadata(publicKey);
            this.metadata = metadata;
        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.errorMessage = 'Failed to load profile data. Please try again later.';
        } finally {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();  // Trigger change detection to update the view
        }
    }
}
