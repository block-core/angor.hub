import { AngorLoadingService } from '@angor/services/loading';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Component,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'angor-loading-bar',
    templateUrl: './loading-bar.component.html',
    styleUrls: ['./loading-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'angorLoadingBar',
    standalone: true,
    imports: [MatProgressBarModule],
})
export class AngorLoadingBarComponent implements OnChanges, OnInit, OnDestroy {
    private _angorLoadingService = inject(AngorLoadingService);

    @Input() autoMode: boolean = true;
    mode: 'determinate' | 'indeterminate';
    progress: number = 0;
    show: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    ngOnChanges(changes: SimpleChanges): void {
        if ('autoMode' in changes) {
            this._angorLoadingService.setAutoMode(
                coerceBooleanProperty(changes.autoMode.currentValue)
            );
        }
    }

    ngOnInit(): void {
        this._angorLoadingService.mode$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.mode = value;
            });

        this._angorLoadingService.progress$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.progress = value;
            });

        this._angorLoadingService.show$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.show = value;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
