import { AngorConfirmationConfig } from '@angor/services/confirmation/confirmation.types';
import { AngorConfirmationDialogComponent } from '@angor/services/confirmation/dialog/dialog.component';
import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { merge } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class AngorConfirmationService {
    private readonly _matDialog = inject(MatDialog);

    // Default configuration for the confirmation dialog
    private readonly _defaultConfig: AngorConfirmationConfig = {
        title: 'Confirm action',
        message: 'Are you sure you want to confirm this action?',
        icon: {
            show: true,
            name: 'heroicons_outline:exclamation-triangle',
            color: 'warn',
        },
        actions: {
            confirm: {
                show: true,
                label: 'Confirm',
                color: 'warn',
            },
            cancel: {
                show: true,
                label: 'Cancel',
            },
        },
        dismissible: false,
    };

    /**
     * Opens a confirmation dialog with the provided or default configuration.
     *
     * @param config - User-defined configuration that overrides the default.
     * @returns A reference to the opened confirmation dialog.
     */
    open(
        config: AngorConfirmationConfig = {}
    ): MatDialogRef<AngorConfirmationDialogComponent> {
        // Merge the user configuration with the default configuration
        const mergedConfig = merge({}, this._defaultConfig, config);

        // Open and return the MatDialog reference
        return this._matDialog.open(AngorConfirmationDialogComponent, {
            autoFocus: false,
            disableClose: !mergedConfig.dismissible,
            data: mergedConfig,
            panelClass: 'angor-confirmation-dialog-panel',
        });
    }
}
