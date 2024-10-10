import {
    Directive,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Directive({
    selector: '[angorScrollReset]',
    exportAs: 'angorScrollReset',
    standalone: true,
})
export class AngorScrollResetDirective implements OnInit, OnDestroy {
    private _elementRef = inject(ElementRef);
    private _router = inject(Router);
    private _unsubscribeAll = new Subject<void>();

    ngOnInit(): void {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._elementRef.nativeElement.scrollTop = 0;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
