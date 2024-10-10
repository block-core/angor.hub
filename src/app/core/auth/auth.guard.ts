import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SignerService } from 'app/services/signer.service';

export const authGuard = () => {
    const signerService = inject(SignerService);
    const router = inject(Router);

    if (signerService.getPublicKey() !== '') {
        return true;
    }

    // Redirect to the login page
    return router.parseUrl('/login');
};
