import { AngorDrawerService } from '@angor/components/drawer/drawer.service';
import {
    AngorDrawerMode,
    AngorDrawerPosition,
} from '@angor/components/drawer/drawer.types';
import { AngorUtilsService } from '@angor/services/utils/utils.service';
import {
    animate,
    AnimationBuilder,
    AnimationPlayer,
    style,
} from '@angular/animations';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';

@Component({
    selector: 'angor-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'angorDrawer',
    standalone: true,
})
export class AngorDrawerComponent implements OnChanges, OnInit, OnDestroy {
    static ngAcceptInputType_fixed: BooleanInput;
    static ngAcceptInputType_opened: BooleanInput;
    static ngAcceptInputType_transparentOverlay: BooleanInput;

    private _animationBuilder = inject(AnimationBuilder);
    private _elementRef = inject(ElementRef);
    private _renderer2 = inject(Renderer2);
    private _angorDrawerService = inject(AngorDrawerService);
    private _angorUtilsService = inject(AngorUtilsService);

    @Input() fixed: boolean = false;
    @Input() mode: AngorDrawerMode = 'side';
    @Input() name: string = this._angorUtilsService.randomId();
    @Input() opened: boolean = false;
    @Input() position: AngorDrawerPosition = 'left';
    @Input() transparentOverlay: boolean = false;
    @Output() readonly fixedChanged = new EventEmitter<boolean>();
    @Output() readonly modeChanged = new EventEmitter<AngorDrawerMode>();
    @Output() readonly openedChanged = new EventEmitter<boolean>();
    @Output() readonly positionChanged =
        new EventEmitter<AngorDrawerPosition>();

    private _animationsEnabled: boolean = false;
    private _hovered: boolean = false;
    private _overlay: HTMLElement;
    private _player: AnimationPlayer;

    @HostBinding('class') get classList(): any {
        return {
            'angor-drawer-animations-enabled': this._animationsEnabled,
            'angor-drawer-fixed': this.fixed,
            'angor-drawer-hover': this._hovered,
            [`angor-drawer-mode-${this.mode}`]: true,
            'angor-drawer-opened': this.opened,
            [`angor-drawer-position-${this.position}`]: true,
        };
    }

    @HostBinding('style') get styleList(): any {
        return {
            visibility: this.opened ? 'visible' : 'hidden',
        };
    }

    @HostListener('mouseenter')
    private _onMouseenter(): void {
        this._enableAnimations();
        this._hovered = true;
    }

    @HostListener('mouseleave')
    private _onMouseleave(): void {
        this._enableAnimations();
        this._hovered = false;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('fixed' in changes) {
            this.fixed = coerceBooleanProperty(changes.fixed.currentValue);
            this.fixedChanged.next(this.fixed);
        }

        if ('mode' in changes) {
            const previousMode = changes.mode.previousValue;
            const currentMode = changes.mode.currentValue;
            this._disableAnimations();

            if (previousMode === 'over' && currentMode === 'side') {
                this._hideOverlay();
            }

            if (
                previousMode === 'side' &&
                currentMode === 'over' &&
                this.opened
            ) {
                this._showOverlay();
            }

            this.modeChanged.next(currentMode);
            setTimeout(() => this._enableAnimations(), 500);
        }

        if ('opened' in changes) {
            const open = coerceBooleanProperty(changes.opened.currentValue);
            this._toggleOpened(open);
        }

        if ('position' in changes) {
            this.positionChanged.next(this.position);
        }

        if ('transparentOverlay' in changes) {
            this.transparentOverlay = coerceBooleanProperty(
                changes.transparentOverlay.currentValue
            );
        }
    }

    ngOnInit(): void {
        this._angorDrawerService.registerComponent(this.name, this);
    }

    ngOnDestroy(): void {
        if (this._player) {
            this._player.finish();
        }
        this._angorDrawerService.deregisterComponent(this.name);
    }

    open(): void {
        if (this.opened) return;
        this._toggleOpened(true);
    }

    close(): void {
        if (!this.opened) return;
        this._toggleOpened(false);
    }

    toggle(): void {
        this.opened ? this.close() : this.open();
    }

    private _enableAnimations(): void {
        if (!this._animationsEnabled) {
            this._animationsEnabled = true;
        }
    }

    private _disableAnimations(): void {
        if (this._animationsEnabled) {
            this._animationsEnabled = false;
        }
    }

    private _showOverlay(): void {
        this._overlay = this._renderer2.createElement('div');
        this._overlay.classList.add('angor-drawer-overlay');
        if (this.fixed) {
            this._overlay.classList.add('angor-drawer-overlay-fixed');
        }
        if (this.transparentOverlay) {
            this._overlay.classList.add('angor-drawer-overlay-transparent');
        }

        this._renderer2.appendChild(
            this._elementRef.nativeElement.parentElement,
            this._overlay
        );

        this._player = this._animationBuilder
            .build([
                style({ opacity: 0 }),
                animate(
                    '300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
                    style({ opacity: 1 })
                ),
            ])
            .create(this._overlay);

        this._player.play();
        this._overlay.addEventListener('click', this._handleOverlayClick);
    }

    private _hideOverlay(): void {
        if (!this._overlay) return;

        this._player = this._animationBuilder
            .build([
                animate(
                    '300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
                    style({ opacity: 0 })
                ),
            ])
            .create(this._overlay);

        this._player.play();
        this._player.onDone(() => {
            if (this._overlay) {
                this._overlay.removeEventListener(
                    'click',
                    this._handleOverlayClick
                );
                this._overlay.parentNode.removeChild(this._overlay);
                this._overlay = null;
            }
        });
    }

    private _toggleOpened(open: boolean): void {
        this.opened = open;
        this._enableAnimations();

        if (this.mode === 'over') {
            open ? this._showOverlay() : this._hideOverlay();
        }

        this.openedChanged.next(open);
    }

    private readonly _handleOverlayClick = (): void => this.close();
}
