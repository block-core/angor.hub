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
import { angorAnimations } from '@angor/animations';
import { AngorAlertComponent, AngorAlertType } from '@angor/components/alert';

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

    constructor(private _formBuilder: UntypedFormBuilder, private _router: Router) {}

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

        const name = this.registerForm.get('name')?.value;
        const username = this.registerForm.get('username')?.value;
        const about = this.registerForm.get('about')?.value;
        const avatarUrl = this.registerForm.get('avatarUrl')?.value;
        const password = this.registerForm.get('password')?.value;

        console.log({ name, username, about, avatarUrl, password });

        this.alert = { type: 'success', message: 'Account created successfully!' };
        this.showAlert = true;

        this._router.navigateByUrl('/home');
    }
}
