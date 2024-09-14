import { AngorAlertComponent } from '@angor/components/alert';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
        CommonModule
    ],
})
export class LoginComponent implements OnInit {
    SecretKeyLoginForm: FormGroup;
    MenemonicLoginForm: FormGroup;
    alert = { type: 'error', message: '' };
    showAlert = false;
    loading = false;
    isInstalledExtension = false;

    constructor(
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _signerService: SignerService
    ) { }

    ngOnInit(): void {
        this.initializeForms();
        this.checkNostrExtensionAvailability();
    }

    private initializeForms(): void {
        this.SecretKeyLoginForm = this._formBuilder.group({
            secretKey: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', Validators.required]
        });

        this.MenemonicLoginForm = this._formBuilder.group({
            menemonic: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', Validators.required]
        });
    }

    private checkNostrExtensionAvailability(): void {
        const globalContext = globalThis as unknown as { nostr?: { signEvent?: Function } };

        if (globalContext.nostr && typeof globalContext.nostr.signEvent === 'function') {
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
        this.showAlert = false;

        this._signerService.saveSecretKeyToSession(secretKey);

        if (this._signerService.getPublicKey()) {
            this._router.navigateByUrl('/home');
        } else {
            this.loading = false;
            this.alert.message = 'Secret key is missing or invalid.';
            this.showAlert = true;
        }
    }

    loginWithMenemonic(): void {
        if (this.MenemonicLoginForm.invalid) {
            return;
        }

        const menemonic = this.MenemonicLoginForm.get('menemonic')?.value;
        const password = this.MenemonicLoginForm.get('password')?.value;

        this.loading = true;
        this.showAlert = false;

        this._signerService.saveSecretKeyToSession(menemonic);

        if (this._signerService.getPublicKey()) {
            this._router.navigateByUrl('/home');
        } else {
            this.loading = false;
            this.alert.message = 'Menemonic is missing or invalid.';
            this.showAlert = true;
        }
    }
}
