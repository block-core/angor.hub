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
 * Fade in animation trigger
 */
const fadeIn = trigger('fadeIn', [
    state('void', style({ opacity: 0 })),
    state('*', style({ opacity: 1 })),

    // No transition if state is false
    transition('void => false', []),

    // Transition for fade-in effect
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Fade in from top animation trigger
 */
const fadeInTop = trigger('fadeInTop', [
    state('void', style({ opacity: 0, transform: 'translate3d(0, -100%, 0)' })),
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),

    transition('void => false', []),
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Fade in from bottom animation trigger
 */
const fadeInBottom = trigger('fadeInBottom', [
    state('void', style({ opacity: 0, transform: 'translate3d(0, 100%, 0)' })),
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),

    transition('void => false', []),
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Fade in from left animation trigger
 */
const fadeInLeft = trigger('fadeInLeft', [
    state('void', style({ opacity: 0, transform: 'translate3d(-100%, 0, 0)' })),
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),

    transition('void => false', []),
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Fade in from right animation trigger
 */
const fadeInRight = trigger('fadeInRight', [
    state('void', style({ opacity: 0, transform: 'translate3d(100%, 0, 0)' })),
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),

    transition('void => false', []),
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.entering} ${AngorAnimationCurves.deceleration}`,
        },
    }),
]);

/**
 * Fade out animation trigger
 */
const fadeOut = trigger('fadeOut', [
    state('*', style({ opacity: 1 })),
    state('void', style({ opacity: 0 })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

/**
 * Fade out to top animation trigger
 */
const fadeOutTop = trigger('fadeOutTop', [
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),
    state('void', style({ opacity: 0, transform: 'translate3d(0, -100%, 0)' })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

/**
 * Fade out to bottom animation trigger
 */
const fadeOutBottom = trigger('fadeOutBottom', [
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),
    state('void', style({ opacity: 0, transform: 'translate3d(0, 100%, 0)' })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

/**
 * Fade out to left animation trigger
 */
const fadeOutLeft = trigger('fadeOutLeft', [
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),
    state('void', style({ opacity: 0, transform: 'translate3d(-100%, 0, 0)' })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

/**
 * Fade out to right animation trigger
 */
const fadeOutRight = trigger('fadeOutRight', [
    state('*', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),
    state('void', style({ opacity: 0, transform: 'translate3d(100%, 0, 0)' })),

    transition('false => void', []),
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AngorAnimationDurations.exiting} ${AngorAnimationCurves.acceleration}`,
        },
    }),
]);

// Export all triggers
export {
    fadeIn,
    fadeInBottom,
    fadeInLeft,
    fadeInRight,
    fadeInTop,
    fadeOut,
    fadeOutBottom,
    fadeOutLeft,
    fadeOutRight,
    fadeOutTop,
};
