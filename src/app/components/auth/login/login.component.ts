import { AngorAlertComponent } from '@angor/components/alert';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { SignerService } from 'app/services/signer.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './login.component.html',
    standalone: true,
    imports: [
        RouterLink,
        AngorAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        CommonModule,
    ],
})
export class LoginComponent implements OnInit {
    SecretKeyLoginForm: FormGroup;
    MenemonicLoginForm: FormGroup;
    secAlert = { type: 'error', message: '' };
    showSecAlert = false;

    menemonicAlert = { type: 'error', message: '' };
    showMenemonicAlert = false;

    loading = false;
    isInstalledExtension = false;
    privateKey: Uint8Array = new Uint8Array();
    publicKey: string = '';
    npub: string = '';
    nsec: string = '';

    constructor(
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _signerService: SignerService
    ) {}

    ngOnInit(): void {
        this.initializeForms();
        this.checkNostrExtensionAvailability();
    }

    private initializeForms(): void {
        this.SecretKeyLoginForm = this._formBuilder.group({
            secretKey: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', Validators.required],
        });

        this.MenemonicLoginForm = this._formBuilder.group({
            menemonic: ['', [Validators.required, Validators.minLength(3)]],
            passphrase: [''], // Passphrase is optional
            password: ['', Validators.required],
        });
    }

    private checkNostrExtensionAvailability(): void {
        const globalContext = globalThis as unknown as {
            nostr?: { signEvent?: Function };
        };

        if (
            globalContext.nostr &&
            typeof globalContext.nostr.signEvent === 'function'
        ) {
            this.isInstalledExtension = true;
        } else {
            this.isInstalledExtension = false;
        }
    }

    loginWithSecretKey(): void {
        if (this.SecretKeyLoginForm.invalid) {
            return;
        }

        const secretKey = this.SecretKeyLoginForm.get('secretKey')?.value;
        const password = this.SecretKeyLoginForm.get('password')?.value;

        this.loading = true;
        this.showSecAlert = false;

        try {
            const success = this._signerService.handleLoginWithKey(
                secretKey,
                password
            ); // Updated method to handle both nsec and hex

            if (success) {
                // Successful login
                this._router.navigateByUrl('/home');
            } else {
                throw new Error('Secret key is missing or invalid.');
            }
        } catch (error) {
            // Handle login failure
            this.loading = false;
            this.secAlert.message =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.';
            this.showSecAlert = true;
            console.error('Login error: ', error);
        }
    }

    loginWithMenemonic(): void {
        if (this.MenemonicLoginForm.invalid) {
            return;
        }

        const menemonic = this.MenemonicLoginForm.get('menemonic')?.value;
        const passphrase =
            this.MenemonicLoginForm.get('passphrase')?.value || ''; // Optional passphrase
        const password = this.MenemonicLoginForm.get('password')?.value;

        this.loading = true;
        this.showMenemonicAlert = false;

        const success = this._signerService.handleLoginWithMenemonic(
            menemonic,
            passphrase,
            password
        );

        if (success) {
            this._router.navigateByUrl('/home');
        } else {
            this.loading = false;
            this.menemonicAlert.message = 'Menemonic is missing or invalid.';
            this.showMenemonicAlert = true;
        }
    }

    async loginWithNostrExtension(): Promise<void> {
        const success = await this._signerService.handleLoginWithExtension();
        if (success) {
            this._router.navigateByUrl('/home');
        } else {
            console.error('Failed to log in using Nostr extension');
        }
    }
}
