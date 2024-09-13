import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    TemplateRef,
    ViewEncapsulation,
    inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'angor-fullscreen',
    templateUrl: './fullscreen.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'angorFullscreen',
    standalone: true,
    imports: [
        MatButtonModule,
        MatTooltipModule,
        NgTemplateOutlet,
        MatIconModule,
    ],
})
export class AngorFullscreenComponent {
    private _document = inject(DOCUMENT);

    @Input() iconTpl: TemplateRef<any>;
    @Input() tooltip: string;

    /**
     * Toggles the fullscreen mode.
     */
    toggleFullscreen(): void {
        if (!this._document.fullscreenEnabled) {
            console.log('Fullscreen is not available in this browser.');
            return;
        }

        const fullScreen = this._document.fullscreenElement;

        // Toggle fullscreen based on the current state
        if (fullScreen) {
            this._document.exitFullscreen();
        } else {
            this._document.documentElement.requestFullscreen().catch(() => {
                console.error('Entering fullscreen mode failed.');
            });
        }
    }
}
