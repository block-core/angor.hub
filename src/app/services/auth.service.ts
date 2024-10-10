import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SignerService } from './signer.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private signerService: SignerService,
        private router: Router
    ) {}

    isLoggedIn() {
        if (this.signerService.getPublicKey()) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
