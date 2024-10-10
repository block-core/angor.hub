/**
 * Defines animation curves for Angor.
 */
export class AngorAnimationCurves {
    static standard = 'cubic-bezier(0.4, 0.0, 0.2, 1)'; // Standard animation curve
    static deceleration = 'cubic-bezier(0.0, 0.0, 0.2, 1)'; // Deceleration curve
    static acceleration = 'cubic-bezier(0.4, 0.0, 1, 1)'; // Acceleration curve
    static sharp = 'cubic-bezier(0.4, 0.0, 0.6, 1)'; // Sharp curve
}

/**
 * Defines animation durations for Angor.
 */
export class AngorAnimationDurations {
    static complex = '375ms'; // Duration for complex animations
    static entering = '225ms'; // Duration for entering animations
    static exiting = '195ms'; // Duration for exiting animations
}
