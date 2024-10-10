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
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    selector: 'settings-notifications',
    templateUrl: './notifications.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        MatButtonModule,
    ],
})
export class SettingsNotificationsComponent implements OnInit {
    notificationsForm: UntypedFormGroup;
    notificationKinds: { [key: string]: number } = {
        mention: 1,
        privateMessage: 4,
        zap: 9735,
        follower: 3,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {}

    ngOnInit(): void {
        const savedSettings = this.loadNotificationSettings();

        this.notificationsForm = this._formBuilder.group({
            mention: [savedSettings.includes(this.notificationKinds.mention)],
            privateMessage: [
                savedSettings.includes(this.notificationKinds.privateMessage),
            ],
            zap: [savedSettings.includes(this.notificationKinds.zap)],
            follower: [savedSettings.includes(this.notificationKinds.follower)],
        });
    }

    saveSettings(): void {
        const formValues = this.notificationsForm.value;
        const enabledKinds: number[] = [];

        if (formValues.mention) {
            enabledKinds.push(this.notificationKinds.mention);
        }
        if (formValues.privateMessage) {
            enabledKinds.push(this.notificationKinds.privateMessage);
        }
        if (formValues.zap) {
            enabledKinds.push(this.notificationKinds.zap);
        }
        if (formValues.follower) {
            enabledKinds.push(this.notificationKinds.follower);
        }

        this.saveNotificationSettings(enabledKinds);
        console.log('Notification settings saved:', enabledKinds);
    }

    private saveNotificationSettings(settings: number[]): void {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }

    private loadNotificationSettings(): number[] {
        const storedSettings = localStorage.getItem('notificationSettings');
        return storedSettings ? JSON.parse(storedSettings) : [1, 3, 4, 7, 9735]; // Default to all kinds if not set
    }
}
