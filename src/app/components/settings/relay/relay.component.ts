import { TitleCasePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'settings-relay',
    templateUrl: './relay.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        TitleCasePipe,
    ],
})
export class SettingsRoleComponent implements OnInit {
    members: any[];
    roles: any[];

    /**
     * Constructor
     */
    constructor() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Setup the team members
        this.members = [
            {
                avatar: 'images/avatars/avatar-placeholder.png',
                name: 'Dejesus Michael',
                email: 'dejesusmichael@mail.org',
                role: 'admin',
            },
            {
                avatar: 'images/avatars/avatar-placeholder.png',
                name: 'Mclaughlin Steele',
                email: 'mclaughlinsteele@mail.me',
                role: 'admin',
            },
            {
                avatar: 'images/avatars/avatar-placeholder.png',
                name: 'Laverne Dodson',
                email: 'lavernedodson@mail.ca',
                role: 'write',
            },
            {
                avatar: 'images/avatars/avatar-placeholder.png',
                name: 'Trudy Berg',
                email: 'trudyberg@mail.us',
                role: 'read',
            },
            {
                avatar: 'images/avatars/avatar-placeholder.png',
                name: 'Lamb Underwood',
                email: 'lambunderwood@mail.me',
                role: 'read',
            },
            {
                avatar: 'images/avatars/avatar-placeholder.png',
                name: 'Mcleod Wagner',
                email: 'mcleodwagner@mail.biz',
                role: 'read',
            },
            {
                avatar: 'images/avatars/avatar-placeholder.png',
                name: 'Shannon Kennedy',
                email: 'shannonkennedy@mail.ca',
                role: 'read',
            },
        ];

        // Setup the roles
        this.roles = [
            {
                label: 'Read',
                value: 'read',
                description:
                    'Can read and clone this repository. Can also open and comment on issues and pull requests.',
            },
            {
                label: 'Write',
                value: 'write',
                description:
                    'Can read, clone, and push to this repository. Can also manage issues and pull requests.',
            },
            {
                label: 'Admin',
                value: 'admin',
                description:
                    'Can read, clone, and push to this repository. Can also manage issues, pull requests, and repository settings, including adding collaborators.',
            },
        ];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
