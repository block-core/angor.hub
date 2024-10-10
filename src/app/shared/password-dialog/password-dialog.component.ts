import { CommonModule, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    MatFormField,
    MatFormFieldModule,
    MatLabel,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SettingsIndexerComponent } from 'app/components/settings/indexer/indexer.component';
import { SettingsNetworkComponent } from 'app/components/settings/network/network.component';
import { SettingsNotificationsComponent } from 'app/components/settings/notifications/notifications.component';
import { SettingsProfileComponent } from 'app/components/settings/profile/profile.component';
import { SettingsRelayComponent } from 'app/components/settings/relay/relay.component';
import { SettingsSecurityComponent } from 'app/components/settings/security/security.component';

@Component({
    selector: 'password-dialog',
    templateUrl: './password-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    ],
    styles: [
        `
            .full-width {
                width: 100%;
            }
        `,
    ],
})
export class PasswordDialogComponent {
    passwordForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<PasswordDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.passwordForm = this.fb.group({
            password: ['', Validators.required],
            duration: ['0', Validators.required], // Default duration is 0 minute
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        this.dialogRef.close(this.passwordForm.value);
    }
}
