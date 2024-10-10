import { angorAnimations } from '@angor/animations';
import { AngorAlertComponent, AngorAlertType } from '@angor/components/alert';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
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
    selector: 'auth-register',
    templateUrl: './register.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: angorAnimations,
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
export class RegisterComponent implements OnInit {
    @ViewChild('registerNgForm') registerNgForm: NgForm;

    alert: { type: AngorAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    registerForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _signerService: SignerService
    ) {}

    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            name: ['', Validators.required],
            username: ['', Validators.required],
            about: [''],
            avatarUrl: [''],
            password: ['', Validators.required],
            agreements: ['', Validators.requiredTrue],
        });
    }

    register(): void {
        if (this.registerForm.invalid) {
            return;
        }

        this.registerForm.disable();

        this.showAlert = false;

        // Get form values
        const name = this.registerForm.get('name')?.value;
        const username = this.registerForm.get('username')?.value;
        const about = this.registerForm.get('about')?.value;
        const avatarUrl = this.registerForm.get('avatarUrl')?.value;
        const password = this.registerForm.get('password')?.value;

        // Generate keys using the security service
        const keys = this._signerService.generateAndStoreKeys(password);

        if (!keys) {
            // If key generation failed, enable the form and show an error
            this.registerForm.enable();
            this.alert = {
                type: 'error',
                message: 'Error generating keys. Please try again.',
            };
            this.showAlert = true;
            return;
        }

        const { secretKey, pubkey, npub, nsec } = keys;

        // Simulate saving user metadata along with keys
        const userMetadata = {
            secretKey,
            name,
            username,
            about,
            avatarUrl,
            password,
            pubkey,
            npub,
            nsec,
        };

        console.log('User Metadata:', userMetadata);

        // Display success alert
        this.alert = {
            type: 'success',
            message: 'Account created successfully!',
        };
        this.showAlert = true;

        // Redirect to home
        this._router.navigateByUrl('/home');
    }
}
