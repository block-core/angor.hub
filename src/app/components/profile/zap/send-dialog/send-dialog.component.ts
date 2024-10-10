import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule, NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
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
import { decode } from '@gandlaf21/bolt11-decode';
import { webln } from '@getalby/sdk';
import { bech32 } from '@scure/base';
import { QRCodeModule } from 'angularx-qrcode';
import { SettingsIndexerComponent } from 'app/components/settings/indexer/indexer.component';
import { SettingsNetworkComponent } from 'app/components/settings/network/network.component';
import { SettingsNotificationsComponent } from 'app/components/settings/notifications/notifications.component';
import { SettingsProfileComponent } from 'app/components/settings/profile/profile.component';
import { SettingsRelayComponent } from 'app/components/settings/relay/relay.component';
import { SettingsSecurityComponent } from 'app/components/settings/security/security.component';
import { LightningService } from 'app/services/lightning.service';

@Component({
    selector: 'app-send-dialog',
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
        MatDialogTitle,
        MatDialogClose,
    ],
    templateUrl: './send-dialog.component.html',
    styleUrls: ['./send-dialog.component.scss'],
})
export class SendDialogComponent {
    sats: string;
    lightningInvoice: string = '';
    lightningResponse: any;
    showInvoiceSection: boolean = false;
    displayQRCode: boolean = false;
    invoiceAmount: string = '?';
    nwc: any;
    constructor(
        private dialogRef: MatDialogRef<SendDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public metadata: any,
        private lightning: LightningService,
        private snackBar: MatSnackBar,
        private clipboard: Clipboard
    ) {
        this.getLightningInfo();
    }

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

    getLightningInfo(): void {
        let lightningAddress = '';
        if (this.metadata?.lud06) {
            const { words } = bech32.decode(this.metadata.lud06, 5000);
            const data = new Uint8Array(bech32.fromWords(words));
            lightningAddress = new TextDecoder().decode(Uint8Array.from(data));
        } else if (this.metadata?.lud16?.toLowerCase().startsWith('lnurl')) {
            const { words } = bech32.decode(this.metadata.lud16, 5000);
            const data = new Uint8Array(bech32.fromWords(words));
            lightningAddress = new TextDecoder().decode(Uint8Array.from(data));
        } else if (this.metadata?.lud16) {
            lightningAddress = this.lightning.getLightningAddress(
                this.metadata.lud16
            );
        }

        if (lightningAddress !== '') {
            this.lightning
                .getLightning(lightningAddress)
                .subscribe((response) => {
                    this.lightningResponse = response;
                    if (this.lightningResponse.status === 'Failed') {
                        this.openSnackBar(
                            'Failed to lookup lightning address',
                            'dismiss'
                        );
                    } else if (this.lightningResponse.callback) {
                        this.showInvoiceSection = true;
                    } else {
                        this.openSnackBar(
                            "Couldn't find user's lightning address",
                            'dismiss'
                        );
                    }
                });
        } else {
            this.openSnackBar('No lightning address found', 'dismiss');
        }
    }

    getLightningInvoice(amount: string): void {
        if (this.lightningResponse && this.lightningResponse.callback) {
            this.lightning
                .getLightningInvoice(this.lightningResponse.callback, amount)
                .subscribe(async (response) => {
                    this.lightningInvoice = response.pr;
                    this.setInvoiceAmount(this.lightningInvoice);
                    this.showInvoiceSection = true;
                    this.showQRCode();
                });
        }
    }

    setInvoiceAmount(invoice: string): void {
        if (invoice) {
            const decodedInvoice = decode(invoice);
            const amountSection = decodedInvoice.sections.find(
                (s) => s.name === 'amount'
            );
            if (amountSection) {
                this.invoiceAmount = String(Number(amountSection.value) / 1000);
            }
        }
    }

    showQRCode(): void {
        this.displayQRCode = !this.displayQRCode;
    }

    sendZap(): void {
        this.getLightningInvoice(String(Number(this.sats) * 1000));
    }

    async payInvoice(): Promise<void> {
        if (!this.lightningInvoice) {
            console.error('Lightning invoice is not set');
            return;
        }

        const nwc = new webln.NostrWebLNProvider({
            nostrWalletConnectUrl: await this.loadNWCUrl(),
        });

        nwc.enable()
            .then(() => {
                return nwc.sendPayment(this.lightningInvoice);
            })
            .then((response) => {
                if (response && response.preimage) {
                    console.log(
                        `Payment successful, preimage: ${response.preimage}`
                    );
                    this.openSnackBar('Zapped!', 'dismiss');
                    this.dialogRef.close();
                } else {
                    this.listenForPaymentStatus(nwc);
                }
            })
            .catch((error) => {
                console.error('Payment failed:', error);
                this.openSnackBar('Failed to pay invoice', 'dismiss');
                this.listenForPaymentStatus(nwc);
            });
    }

    loadNWCUrl(): Promise<string> {
        const nwc = webln.NostrWebLNProvider.withNewSecret();

        return nwc
            .initNWC({ name: 'Angor Hub' })
            .then(() => {
                return nwc.getNostrWalletConnectUrl();
            })
            .catch((error) => {
                console.error('Error initializing NWC:', error);
                throw error;
            });
    }

    listenForPaymentStatus(nwc): void {
        const checkPaymentStatus = () => {
            nwc.sendPayment(this.lightningInvoice)
                .then((response) => {
                    if (response && response.preimage) {
                        console.log(
                            'Payment confirmed, preimage:',
                            response.preimage
                        );
                        this.openSnackBar('Payment confirmed!', 'dismiss');
                        this.dialogRef.close();
                    } else {
                        setTimeout(checkPaymentStatus, 5000);
                    }
                })
                .catch((error) => {
                    console.error('Error checking payment status:', error);
                    setTimeout(checkPaymentStatus, 5000);
                });
        };

        checkPaymentStatus();
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
