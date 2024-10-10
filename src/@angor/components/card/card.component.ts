import { angorAnimations } from '@angor/animations';
import { AngorCardFace } from '@angor/components/card/card.types';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Component,
    HostBinding,
    Input,
    OnChanges,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';

@Component({
    selector: 'angor-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: angorAnimations,
    exportAs: 'angorCard',
    standalone: true,
    imports: [],
})
export class AngorCardComponent implements OnChanges {
    static ngAcceptInputType_expanded: BooleanInput;
    static ngAcceptInputType_flippable: BooleanInput;

    @Input() expanded: boolean = false;
    @Input() face: AngorCardFace = 'front';
    @Input() flippable: boolean = false;

    /**
     * Host binding for component classes
     */
    @HostBinding('class') get classList(): any {
        return {
            'angor-card-expanded': this.expanded,
            'angor-card-face-back': this.flippable && this.face === 'back',
            'angor-card-face-front': this.flippable && this.face === 'front',
            'angor-card-flippable': this.flippable,
        };
    }

    /**
     * Handle input changes
     *
     * @param changes Input changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if ('expanded' in changes) {
            this.expanded = coerceBooleanProperty(
                changes.expanded.currentValue
            );
        }

        if ('flippable' in changes) {
            this.flippable = coerceBooleanProperty(
                changes.flippable.currentValue
            );
        }
    }
}
