import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import {
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import {
    MatFormField,
    MatFormFieldModule,
    MatLabel,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { webln } from '@getalby/sdk';
import { QRCodeModule } from 'angularx-qrcode';
import { SettingsIndexerComponent } from 'app/components/settings/indexer/indexer.component';
import { SettingsNetworkComponent } from 'app/components/settings/network/network.component';
import { SettingsNotificationsComponent } from 'app/components/settings/notifications/notifications.component';
import { SettingsProfileComponent } from 'app/components/settings/profile/profile.component';
import { SettingsRelayComponent } from 'app/components/settings/relay/relay.component';
import { SettingsSecurityComponent } from 'app/components/settings/security/security.component';

@Component({
    selector: 'app-receive-dialog',
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
        MatDialogContent,
        MatDialogActions,
        QRCodeModule,
        MatDivider,
        MatTooltip,
        MatDialogClose,
    ],
    templateUrl: './receive-dialog.component.html',
    styleUrls: ['./receive-dialog.component.scss'],
})
export class ReceiveDialogComponent {
    invoiceAmount: string = '';
    lightningInvoice: string = '';
    displayQRCode: boolean = false;
    nwc: any;

    constructor(
        private dialogRef: MatDialogRef<ReceiveDialogComponent>,
        private snackBar: MatSnackBar,
        private clipboard: Clipboard
    ) {}

    zapButtons = [
        { icon: 'thumb_up', label: '50', value: 50 },
        { icon: 'favorite', label: '100', value: 100 },
        { icon: 'emoji_emotions', label: '500', value: 500 },
        { icon: 'star', label: '1k', value: 1000 },
        { icon: 'celebration', label: '5k', value: 5000 },
        { icon: 'rocket', label: '10k', value: 10000 },
        { icon: 'local_fire_department', label: '100k', value: 100000 },
        { icon: 'flash_on', label: '500k', value: 500000 },
        { icon: 'diamond', label: '1M', value: 1000000 },
    ];

    async generateInvoice(): Promise<void> {
        if (!this.invoiceAmount || Number(this.invoiceAmount) <= 0) {
            this.openSnackBar('Please enter a valid amount', 'dismiss');
            return;
        }

        try {
            this.nwc = new webln.NostrWebLNProvider({
                nostrWalletConnectUrl: await this.loadNWCUrl(),
            });
            await this.nwc.enable();

            const invoiceResponse = await this.nwc.makeInvoice({
                amount: Number(this.invoiceAmount),
            });
            this.lightningInvoice = invoiceResponse.paymentRequest;

            this.showQRCode();
        } catch (error) {
            console.error('Error generating invoice:', error);
            this.openSnackBar('Failed to generate invoice', 'dismiss');
        }
    }

    async loadNWCUrl(): Promise<string> {
        try {
            const nwc = webln.NostrWebLNProvider.withNewSecret();
            await nwc.initNWC({ name: 'Angor Hub' });
            return nwc.getNostrWalletConnectUrl();
        } catch (error) {
            console.error('Error initializing NWC:', error);
            throw new Error('Failed to initialize NWC provider');
        }
    }

    showQRCode(): void {
        this.displayQRCode = !this.displayQRCode;
    }

    copyInvoice(): void {
        if (this.lightningInvoice) {
            this.clipboard.copy(this.lightningInvoice);
            this.openSnackBar('Invoice copied', 'dismiss');
        } else {
            this.openSnackBar('No invoice available to copy', 'dismiss');
        }
    }

    openSnackBar(message: string, action: string): void {
        this.snackBar.open(message, action, { duration: 1300 });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
