import { AngorAlertComponent } from '@angor/components/alert';
import { CommonModule, I18nPluralPipe } from '@angular/common';
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
    signInForm: FormGroup;
    alert = { type: 'error', message: '' };
    showAlert = false;
    loading = false;

    constructor(
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _signerService: SignerService
    ) { }

    ngOnInit(): void {
        this.signInForm = this._formBuilder.group({
            privateKey: ['', Validators.required],
            publicKey: ['', Validators.required],
        });
    }

    signIn(): void {
        if (this.signInForm.invalid) {
            return;
        }

        const privateKey = this.signInForm.get('privateKey').value;
        const publicKey = this.signInForm.get('publicKey').value;

        this.loading = true;
        this.showAlert = false;

        // Save private and public keys in the service
        this._signerService.savePrivateKeyToSession(privateKey);
        this._signerService.savePublicKeyToSession(publicKey);

        if (this._signerService.getPublicKey()) {
            this._router.navigateByUrl('/home');
        } else {
            this.loading = false;
            this.alert.message = 'Public key is missing or invalid.';
            this.showAlert = true;
        }
    }
}
