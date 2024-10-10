import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SignerService } from 'app/services/signer.service';

@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSlideToggleModule,
        MatButtonModule,
    ],
})
export class SettingsSecurityComponent implements OnInit {
    securityForm: UntypedFormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _signerService: SignerService
    ) {}

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.securityForm = this._formBuilder.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(3)]],
            twoStep: [true],
            askPasswordChange: [false],
            savePassword: [false], // Toggle for saving password
        });
    }

    /**
     * Change password method
     */
    async changePassword(): Promise<void> {
        if (this.securityForm.invalid) {
            return;
        }

        const currentPassword = this.securityForm.get('currentPassword')?.value;
        const newPassword = this.securityForm.get('newPassword')?.value;
        const savePassword = this.securityForm.get('savePassword')?.value;

        try {
            const success = await this._signerService.changePassword(
                currentPassword,
                newPassword,
                savePassword // Save password toggle value
            );

            if (success) {
                alert('Password successfully changed.');
            } else {
                alert('Password change failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during password change:', error);
        }
    }
}
