import {
    ScrollbarGeometry,
    ScrollbarPosition,
} from '@angor/directives/scrollbar/scrollbar.types';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    inject,
} from '@angular/core';
import { merge } from 'lodash-es';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subject, debounceTime, fromEvent, takeUntil } from 'rxjs';

@Directive({
    selector: '[angorScrollbar]',
    exportAs: 'angorScrollbar',
    standalone: true,
})
export class AngorScrollbarDirective implements OnChanges, OnInit, OnDestroy {
    static ngAcceptInputType_angorScrollbar: BooleanInput;

    private _elementRef = inject(ElementRef);
    private _platform = inject(Platform);

    @Input() angorScrollbar: boolean = true;
    @Input() angorScrollbarOptions: PerfectScrollbar.Options;

    private _animation: number;
    private _options: PerfectScrollbar.Options;
    private _ps: PerfectScrollbar | null = null;
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    get elementRef(): ElementRef {
        return this._elementRef;
    }

    get ps(): PerfectScrollbar | null {
        return this._ps;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('angorScrollbar' in changes) {
            this.angorScrollbar = coerceBooleanProperty(
                changes.angorScrollbar.currentValue
            );
            this.angorScrollbar
                ? this._initScrollbar()
                : this._destroyScrollbar();
        }

        if ('angorScrollbarOptions' in changes) {
            this._options = merge(
                {},
                this._options,
                changes.angorScrollbarOptions.currentValue
            );
            this._reinitializeScrollbar();
        }
    }

    ngOnInit(): void {
        fromEvent(window, 'resize')
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(150))
            .subscribe(() => this.update());
    }

    ngOnDestroy(): void {
        this._destroyScrollbar();
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isEnabled(): boolean {
        return this.angorScrollbar;
    }

    update(): void {
        this._ps?.update();
    }

    destroy(): void {
        this.ngOnDestroy();
    }

    geometry(prefix: string = 'scroll'): ScrollbarGeometry {
        return new ScrollbarGeometry(
            this._elementRef.nativeElement[`${prefix}Left`],
            this._elementRef.nativeElement[`${prefix}Top`],
            this._elementRef.nativeElement[`${prefix}Width`],
            this._elementRef.nativeElement[`${prefix}Height`]
        );
    }

    position(absolute: boolean = false): ScrollbarPosition {
        if (!absolute && this._ps) {
            return new ScrollbarPosition(
                this._ps.reach.x || 0,
                this._ps.reach.y || 0
            );
        } else {
            return new ScrollbarPosition(
                this._elementRef.nativeElement.scrollLeft,
                this._elementRef.nativeElement.scrollTop
            );
        }
    }

    scrollTo(x: number, y?: number, speed?: number): void {
        if (y == null && speed == null) {
            this.animateScrolling('scrollTop', x, speed);
        } else {
            if (x != null) {
                this.scrollToX(x, speed);
            }

            if (y != null) {
                this.scrollToY(y, speed);
            }
        }
    }

    scrollToX(x: number, speed?: number): void {
        this.animateScrolling('scrollLeft', x, speed);
    }

    scrollToY(y: number, speed?: number): void {
        this.animateScrolling('scrollTop', y, speed);
    }

    scrollToTop(offset: number = 0, speed?: number): void {
        this.animateScrolling('scrollTop', offset, speed);
    }

    scrollToBottom(offset: number = 0, speed?: number): void {
        const top =
            this._elementRef.nativeElement.scrollHeight -
            this._elementRef.nativeElement.clientHeight;
        this.animateScrolling('scrollTop', top - offset, speed);
    }

    scrollToLeft(offset: number = 0, speed?: number): void {
        this.animateScrolling('scrollLeft', offset, speed);
    }

    scrollToRight(offset: number = 0, speed?: number): void {
        const left =
            this._elementRef.nativeElement.scrollWidth -
            this._elementRef.nativeElement.clientWidth;
        this.animateScrolling('scrollLeft', left - offset, speed);
    }

    scrollToElement(
        selector: string,
        offset: number = 0,
        ignoreVisible: boolean = false,
        speed?: number
    ): void {
        const element = this._elementRef.nativeElement.querySelector(selector);
        if (!element) return;

        const elementPos = element.getBoundingClientRect();
        const scrollerPos =
            this._elementRef.nativeElement.getBoundingClientRect();

        if (this._elementRef.nativeElement.classList.contains('ps--active-x')) {
            this._scrollToInAxis(
                elementPos.left,
                scrollerPos.left,
                'scrollLeft',
                offset,
                ignoreVisible,
                speed
            );
        }

        if (this._elementRef.nativeElement.classList.contains('ps--active-y')) {
            this._scrollToInAxis(
                elementPos.top,
                scrollerPos.top,
                'scrollTop',
                offset,
                ignoreVisible,
                speed
            );
        }
    }

    animateScrolling(target: string, value: number, speed?: number): void {
        if (this._animation) {
            window.cancelAnimationFrame(this._animation);
        }

        if (!speed || typeof window === 'undefined') {
            this._elementRef.nativeElement[target] = value;
        } else if (value !== this._elementRef.nativeElement[target]) {
            this._smoothScroll(target, value, speed);
        }
    }

    private _initScrollbar(): void {
        if (
            this._ps ||
            this._platform.ANDROID ||
            this._platform.IOS ||
            !this._platform.isBrowser
        )
            return;
        this._ps = new PerfectScrollbar(this._elementRef.nativeElement, {
            ...this._options,
        });
    }

    private _destroyScrollbar(): void {
        this._ps?.destroy();
        this._ps = null;
    }

    private _reinitializeScrollbar(): void {
        setTimeout(() => this._destroyScrollbar());
        setTimeout(() => this._initScrollbar());
    }

    private _scrollToInAxis(
        elementPos: number,
        scrollerPos: number,
        target: string,
        offset: number,
        ignoreVisible: boolean,
        speed?: number
    ): void {
        if (ignoreVisible && elementPos <= scrollerPos - Math.abs(offset))
            return;

        const currentPos = this._elementRef.nativeElement[target];
        const position = elementPos - scrollerPos + currentPos;
        this.animateScrolling(target, position + offset, speed);
    }

    private _smoothScroll(target: string, value: number, speed: number): void {
        let scrollCount = 0;
        let oldValue = this._elementRef.nativeElement[target];
        const cosParameter = (oldValue - value) / 2;
        let oldTimestamp = performance.now();

        const step = (newTimestamp: number) => {
            scrollCount += Math.PI / (speed / (newTimestamp - oldTimestamp));
            const newValue = Math.round(
                value + cosParameter + cosParameter * Math.cos(scrollCount)
            );

            if (this._elementRef.nativeElement[target] === oldValue) {
                if (scrollCount >= Math.PI) {
                    this.animateScrolling(target, value, 0);
                } else {
                    this._elementRef.nativeElement[target] = newValue;
                    oldValue = this._elementRef.nativeElement[target];
                    oldTimestamp = newTimestamp;
                    this._animation = window.requestAnimationFrame(step);
                }
            }
        };

        window.requestAnimationFrame(step);
    }
}
