import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { hexToBytes } from '@noble/hashes/utils';
import { MetadataService } from 'app/services/metadata.service';
import { RelayService } from 'app/services/relay.service';
import { SignerService } from 'app/services/signer.service';
import { PasswordDialogComponent } from 'app/shared/password-dialog/password-dialog.component';
import { NostrEvent, UnsignedEvent, finalizeEvent } from 'nostr-tools';

@Component({
    selector: 'settings-profile',
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        CommonModule,
    ],
})
export class SettingsProfileComponent implements OnInit {
    profileForm: FormGroup;
    content: string;

    constructor(
        private fb: FormBuilder,
        private signerService: SignerService,
        private metadataService: MetadataService,
        private relayService: RelayService,
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            username: [''],
            displayName: [''],
            website: [''],
            about: [''],
            picture: [''],
            banner: [''],
            lud06: [''],
            lud16: [
                '',
                Validators.pattern('^[a-z0-9._-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
            ],
            nip05: [
                '',
                Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
            ],
        });

        this.setValues();
    }

    async setValues() {
        let kind0 = await this.metadataService.getUserMetadata(
            this.signerService.getPublicKey()
        );
        if (kind0) {
            this.profileForm.setValue({
                name: kind0.name || '',
                username: kind0.username || '',
                displayName: kind0.displayName || '',
                website: kind0.website || '',
                about: kind0.about || '',
                picture: kind0.picture || '',
                banner: kind0.banner || '',
                lud06: kind0.lud06 || '',
                lud16: kind0.lud16 || '',
                nip05: kind0.nip05 || '',
            });
        }
    }

    onSubmit() {
        if (this.profileForm.valid) {
            this.submit();
        } else {
            console.error('Form is invalid');
        }
    }

    async submit() {
        const profileData = this.profileForm.value;
        this.content = JSON.stringify(profileData);

        if (this.signerService.isUsingSecretKey()) {
            const storedPassword = this.signerService.getPassword();
            if (storedPassword) {
                try {
                    const privateKey =
                        await this.signerService.getSecretKey(storedPassword);
                    this.signEvent(privateKey);
                } catch (error) {
                    console.error(error);
                }
            } else {
                const dialogRef = this.dialog.open(PasswordDialogComponent, {
                    width: '300px',
                    disableClose: true,
                });

                dialogRef.afterClosed().subscribe(async (result) => {
                    if (result && result.password) {
                        try {
                            const privateKey =
                                await this.signerService.getSecretKey(
                                    result.password
                                );
                            this.signEvent(privateKey);
                            if (result.duration != 0) {
                                this.signerService.savePassword(
                                    result.password,
                                    result.duration
                                );
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        console.error('Password not provided');
                    }
                });
            }
        } else if (this.signerService.isUsingExtension()) {
            const unsignedEvent: UnsignedEvent =
                this.signerService.getUnsignedEvent(0, [], this.content);
            const signedEvent =
                await this.signerService.signEventWithExtension(unsignedEvent);
            this.publishSignedEvent(signedEvent);
        }
    }

    async signEvent(privateKey: string) {
        const unsignedEvent: UnsignedEvent =
            this.signerService.getUnsignedEvent(0, [], this.content);
        const privateKeyBytes = hexToBytes(privateKey);
        const signedEvent: NostrEvent = finalizeEvent(
            unsignedEvent,
            privateKeyBytes
        );
        this.publishSignedEvent(signedEvent);
    }

    publishSignedEvent(signedEvent: NostrEvent) {
        this.relayService.publishEventToRelays(signedEvent);
        console.log('Profile Updated!');
        this.router.navigate([`/profile`]);
    }
}
