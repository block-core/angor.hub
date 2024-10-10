// Types
export type Scheme = 'auto' | 'dark' | 'light';
export type Screens = Record<string, string>;
export type Theme = 'theme-default' | string;
export type Themes = Array<{ id: string; name: string }>;

/**
 * AngorConfig interface to strictly type the app's configuration object.
 * This ensures consistency when defining or updating app settings.
 */
export interface AngorConfig {
    layout: string; // Layout type (e.g., 'vertical', 'horizontal')
    scheme: Scheme; // Color scheme: 'auto', 'dark', or 'light'
    screens: Screens; // Screen breakpoints, e.g., { 'xs': '600px', ... }
    theme: Theme; // Active theme identifier, e.g., 'theme-default'
    themes: Themes; // List of available themes, each with an id and name
}
