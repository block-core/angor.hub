import { angorAnimations } from '@angor/animations';
import { AngorAlertService } from '@angor/components/alert/alert.service';
import {
    AngorAlertAppearance,
    AngorAlertType,
} from '@angor/components/alert/alert.types';
import { AngorUtilsService } from '@angor/services/utils/utils.service';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
    inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, filter, takeUntil } from 'rxjs';

@Component({
    selector: 'angor-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: angorAnimations,
    exportAs: 'angorAlert',
    standalone: true,
    imports: [MatIconModule, MatButtonModule],
})
export class AngorAlertComponent implements OnChanges, OnInit, OnDestroy {
    static ngAcceptInputType_dismissible: BooleanInput;
    static ngAcceptInputType_dismissed: BooleanInput;
    static ngAcceptInputType_showIcon: BooleanInput;

    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _angorAlertService = inject(AngorAlertService);
    private _angorUtilsService = inject(AngorUtilsService);

    @Input() appearance: AngorAlertAppearance = 'soft';
    @Input() dismissed: boolean = false;
    @Input() dismissible: boolean = false;
    @Input() name: string = this._angorUtilsService.randomId();
    @Input() showIcon: boolean = true;
    @Input() type: AngorAlertType = 'primary';
    @Output() readonly dismissedChanged: EventEmitter<boolean> =
        new EventEmitter<boolean>();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Host binding for component classes.
     */
    @HostBinding('class') get classList(): any {
        return {
            'angor-alert-appearance-border': this.appearance === 'border',
            'angor-alert-appearance-fill': this.appearance === 'fill',
            'angor-alert-appearance-outline': this.appearance === 'outline',
            'angor-alert-appearance-soft': this.appearance === 'soft',
            'angor-alert-dismissed': this.dismissed,
            'angor-alert-dismissible': this.dismissible,
            'angor-alert-show-icon': this.showIcon,
            'angor-alert-type-primary': this.type === 'primary',
            'angor-alert-type-accent': this.type === 'accent',
            'angor-alert-type-warn': this.type === 'warn',
            'angor-alert-type-basic': this.type === 'basic',
            'angor-alert-type-info': this.type === 'info',
            'angor-alert-type-success': this.type === 'success',
            'angor-alert-type-warning': this.type === 'warning',
            'angor-alert-type-error': this.type === 'error',
        };
    }

    /**
     * Handles input changes and updates the component state accordingly.
     *
     * @param changes Input changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if ('dismissed' in changes) {
            this.dismissed = coerceBooleanProperty(
                changes.dismissed.currentValue
            );
            this._toggleDismiss(this.dismissed);
        }

        if ('dismissible' in changes) {
            this.dismissible = coerceBooleanProperty(
                changes.dismissible.currentValue
            );
        }

        if ('showIcon' in changes) {
            this.showIcon = coerceBooleanProperty(
                changes.showIcon.currentValue
            );
        }
    }

    /**
     * Initializes component and subscribes to alert service events.
     */
    ngOnInit(): void {
        this._angorAlertService.onDismiss
            .pipe(
                filter((name) => this.name === name),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.dismiss();
            });

        this._angorAlertService.onShow
            .pipe(
                filter((name) => this.name === name),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.show();
            });
    }

    /**
     * Cleans up subscriptions to avoid memory leaks.
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Dismisses the alert.
     */
    dismiss(): void {
        if (this.dismissed) {
            return;
        }
        this._toggleDismiss(true);
    }

    /**
     * Shows the dismissed alert.
     */
    show(): void {
        if (!this.dismissed) {
            return;
        }
        this._toggleDismiss(false);
    }

    /**
     * Toggles the dismissed state of the alert.
     *
     * @param dismissed Boolean indicating if the alert is dismissed
     */
    private _toggleDismiss(dismissed: boolean): void {
        if (!this.dismissible) {
            return;
        }

        this.dismissed = dismissed;
        this.dismissedChanged.next(this.dismissed);
        this._changeDetectorRef.markForCheck();
    }
}
