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
 * Slide in from top animation trigger
 */
const slideInTop = trigger('slideInTop', [
    state('void', style({ transform: 'translate3d(0, -100%, 0)' })),
    state('*', style({ transform: 'translate3d(0, 0, 0)' })),

    // No transition if state is false
    transition('void => false', []),

    // Slide in transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Slide in from bottom animation trigger
 */
const slideInBottom = trigger('slideInBottom', [
    state('void', style({ transform: 'translate3d(0, 100%, 0)' })),
    state('*', style({ transform: 'translate3d(0, 0, 0)' })),

    transition('void => false', []),
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Slide in from left animation trigger
 */
const slideInLeft = trigger('slideInLeft', [
    state('void', style({ transform: 'translate3d(-100%, 0, 0)' })),
    state('*', style({ transform: 'translate3d(0, 0, 0)' })),

    transition('void => false', []),
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Slide in from right animation trigger
 */
const slideInRight = trigger('slideInRight', [
    state('void', style({ transform: 'translate3d(100%, 0, 0)' })),
    state('*', style({ transform: 'translate3d(0, 0, 0)' })),

    transition('void => false', []),
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Slide out to top animation trigger
 */
const slideOutTop = trigger('slideOutTop', [
    state('*', style({ transform: 'translate3d(0, 0, 0)' })),
    state('void', style({ transform: 'translate3d(0, -100%, 0)' })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

/**
 * Slide out to bottom animation trigger
 */
const slideOutBottom = trigger('slideOutBottom', [
    state('*', style({ transform: 'translate3d(0, 0, 0)' })),
    state('void', style({ transform: 'translate3d(0, 100%, 0)' })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

/**
 * Slide out to left animation trigger
 */
const slideOutLeft = trigger('slideOutLeft', [
    state('*', style({ transform: 'translate3d(0, 0, 0)' })),
    state('void', style({ transform: 'translate3d(-100%, 0, 0)' })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

/**
 * Slide out to right animation trigger
 */
const slideOutRight = trigger('slideOutRight', [
    state('*', style({ transform: 'translate3d(0, 0, 0)' })),
    state('void', style({ transform: 'translate3d(100%, 0, 0)' })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

// Export all slide animations
export {
    slideInBottom,
    slideInLeft,
    slideInRight,
    slideInTop,
    slideOutBottom,
    slideOutLeft,
    slideOutRight,
    slideOutTop,
};
