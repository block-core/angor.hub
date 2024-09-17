import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ViewEncapsulation,
    OnInit,
    OnDestroy,
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
import { SignerService } from 'app/services/signer.service';
import { MetadataService } from 'app/services/metadata.service';
import { Subject, takeUntil } from 'rxjs';
import { IndexedDBService } from 'app/services/indexed-db.service';

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
export class ProfileComponent implements OnInit, OnDestroy {
    user: any;
    isLoading: boolean = true;
    errorMessage: string | null = null;
    metadata: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _metadataService: MetadataService,
        private _signerService: SignerService,
        private _indexedDBService: IndexedDBService
    ) { }

    ngOnInit(): void {
        this.loadUserProfile();


        this._indexedDBService.getMetadataStream()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedMetadata) => {
                if (updatedMetadata && updatedMetadata.pubkey === this.user?.pubkey) {
                    this.metadata = updatedMetadata.metadata;
                    this._changeDetectorRef.detectChanges();
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private async loadUserProfile(): Promise<void> {
        this.isLoading = true;
        this.errorMessage = null;
        const publicKey = this._signerService.getPublicKey();

        if (!publicKey) {
            this.errorMessage = 'No public key found. Please log in again.';
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();
            return;
        }


        this.user = { pubkey: publicKey };

        try {

            const metadata = await this._metadataService.fetchMetadataWithCache(publicKey);
            if (metadata) {
                this.metadata = metadata;
                this._changeDetectorRef.detectChanges();
            }


            this._metadataService.getMetadataStream()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((updatedMetadata) => {
                    if (updatedMetadata && updatedMetadata.pubkey === publicKey) {
                        this.metadata = updatedMetadata;
                        this._changeDetectorRef.detectChanges();
                    }
                });
        } catch (error) {
            console.error('Failed to load profile data:', error);
            this.errorMessage = 'Failed to load profile data. Please try again later.';
            this._changeDetectorRef.detectChanges();
        } finally {
            this.isLoading = false;
            this._changeDetectorRef.detectChanges();
        }
    }
}
