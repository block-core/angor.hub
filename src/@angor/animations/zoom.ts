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
 * Creates a reusable animation trigger with configurable parameters.
 * @param name The name of the animation trigger.
 * @param initialState The initial state style.
 * @param finalState The final state style.
 * @param timings Animation timings and curves.
 * @param entering Default timings for entering state.
 * @param exiting Default timings for exiting state.
 */
const createAnimationTrigger = (
    name: string,
    initialState: Record<string, any>,
    finalState: Record<string, any>,
    timings: string,
    entering: string = `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
    exiting: string = `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`
) => {
    return trigger(name, [
        state('void', style(initialState)),
        state('*', style(finalState)),

        // No transition if state is false
        transition('void => false, * => false', []),

        // Transition for entering state
        transition('void => *', animate(timings || entering), {
            params: { timings: entering },
        }),

        // Transition for exiting state
        transition('* => void', animate(timings || exiting), {
            params: { timings: exiting },
        }),
    ]);
};

/**
 * Zoom in animation trigger using the reusable function
 */
const zoomIn = createAnimationTrigger(
    'zoomIn',
    { opacity: 0, transform: 'scale(0.5)' },
    { opacity: 1, transform: 'scale(1)' },
    ''
);

/**
 * Zoom out animation trigger using the reusable function
 */
const zoomOut = createAnimationTrigger(
    'zoomOut',
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(0.5)' },
    ''
);

export { zoomIn, zoomOut };
