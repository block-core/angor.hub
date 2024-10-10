import { AngorNavigationService } from '@angor/components/navigation/navigation.service';
import { AngorNavigationItem } from '@angor/components/navigation/navigation.types';
import { AngorVerticalNavigationBasicItemComponent } from '@angor/components/navigation/vertical/components/basic/basic.component';
import { AngorVerticalNavigationCollapsableItemComponent } from '@angor/components/navigation/vertical/components/collapsable/collapsable.component';
import { AngorVerticalNavigationDividerItemComponent } from '@angor/components/navigation/vertical/components/divider/divider.component';
import { AngorVerticalNavigationSpacerItemComponent } from '@angor/components/navigation/vertical/components/spacer/spacer.component';
import { AngorVerticalNavigationComponent } from '@angor/components/navigation/vertical/vertical.component';
import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    forwardRef,
    inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'angor-vertical-navigation-group-item',
    templateUrl: './group.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgClass,
        MatIconModule,
        AngorVerticalNavigationBasicItemComponent,
        AngorVerticalNavigationCollapsableItemComponent,
        AngorVerticalNavigationDividerItemComponent,
        forwardRef(() => AngorVerticalNavigationGroupItemComponent),
        AngorVerticalNavigationSpacerItemComponent,
    ],
})
export class AngorVerticalNavigationGroupItemComponent
    implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_autoCollapse: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _angorNavigationService = inject(AngorNavigationService);

    @Input() autoCollapse: boolean;
    @Input() item: AngorNavigationItem;
    @Input() name: string;

    private _angorVerticalNavigationComponent: AngorVerticalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the parent navigation component
        this._angorVerticalNavigationComponent =
            this._angorNavigationService.getComponent(this.name);

        // Subscribe to onRefreshed on the navigation component
        this._angorVerticalNavigationComponent.onRefreshed
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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
