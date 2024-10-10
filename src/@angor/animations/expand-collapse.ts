import {
    AngorAnimationCurves,
    AngorAnimationDurations,
} from '@angor/animations/defaults';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

/**
 * Animation trigger for expand/collapse transitions
 */
const expandCollapse = trigger('expandCollapse', [
    // Collapsed state with height 0
    state(
        'void, collapsed',
        style({
            height: '0',
        })
    ),

    // Expanded state with natural height
    state('*, expanded', style('*')),

    // No transition when state is false
    transition('void <=> false, collapsed <=> false, expanded <=> false', []),

    // Transition between collapsed and expanded states
    transition('void <=> *, collapsed <=> expanded', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

export { expandCollapse };
