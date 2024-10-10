import {
    IsActiveMatchOptions,
    Params,
    QueryParamsHandling,
} from '@angular/router';

export interface AngorNavigationItem {
    id?: string;
    title?: string;
    subtitle?: string;
    type: 'aside' | 'basic' | 'collapsable' | 'divider' | 'group' | 'spacer';
    hidden?: (item: AngorNavigationItem) => boolean;
    active?: boolean;
    disabled?: boolean;
    tooltip?: string;
    link?: string;
    fragment?: string;
    preserveFragment?: boolean;
    queryParams?: Params | null;
    queryParamsHandling?: QueryParamsHandling | null;
    externalLink?: boolean;
    target?: '_blank' | '_self' | '_parent' | '_top' | string;
    exactMatch?: boolean;
    isActiveMatchOptions?: IsActiveMatchOptions;
    function?: (item: AngorNavigationItem) => void;
    classes?: {
        title?: string;
        subtitle?: string;
        icon?: string;
        wrapper?: string;
    };
    icon?: string;
    badge?: {
        title?: string;
        classes?: string;
    };
    children?: AngorNavigationItem[];
    meta?: any;
}

export type AngorVerticalNavigationAppearance =
    | 'default'
    | 'compact'
    | 'dense'
    | 'thin';
export type AngorVerticalNavigationMode = 'over' | 'side';
export type AngorVerticalNavigationPosition = 'left' | 'right';
