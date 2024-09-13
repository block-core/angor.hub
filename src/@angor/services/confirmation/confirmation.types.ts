export interface AngorConfirmationConfig {
    title?: string;
    message?: string;
    icon?: {
        show?: boolean;
        name?: string;
        color?: IconColor;
    };
    actions?: {
        confirm?: ActionConfig;
        cancel?: ActionConfig;
    };
    dismissible?: boolean;
}

/**
 * A type for icon color options used in confirmation dialogs.
 */
export type IconColor =
    | 'primary'
    | 'accent'
    | 'warn'
    | 'basic'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';

/**
 * A common structure for confirm and cancel action configurations.
 */
export interface ActionConfig {
    show?: boolean;
    label?: string;
    color?: 'primary' | 'accent' | 'warn';
}
