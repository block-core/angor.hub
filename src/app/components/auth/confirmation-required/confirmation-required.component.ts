import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { angorAnimations } from '@angor/animations';

@Component({
    selector: 'auth-confirmation-required',
    templateUrl: './confirmation-required.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: angorAnimations,
    standalone: true,
    imports: [RouterLink],
})
export class AuthConfirmationRequiredComponent {
    /**
     * Constructor
     */
    constructor() {}
}
