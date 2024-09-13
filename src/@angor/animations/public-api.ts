import { expandCollapse } from '@angor/animations/expand-collapse';
import {
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
} from '@angor/animations/fade';
import { shake } from '@angor/animations/shake';
import {
    slideInBottom,
    slideInLeft,
    slideInRight,
    slideInTop,
    slideOutBottom,
    slideOutLeft,
    slideOutRight,
    slideOutTop,
} from '@angor/animations/slide';
import { zoomIn, zoomOut } from '@angor/animations/zoom';

/**
 * Array of all Angor animations
 */
export const angorAnimations = [
    expandCollapse,
    fadeIn,
    fadeInTop,
    fadeInBottom,
    fadeInLeft,
    fadeInRight,
    fadeOut,
    fadeOutTop,
    fadeOutBottom,
    fadeOutLeft,
    fadeOutRight,
    shake,
    slideInTop,
    slideInBottom,
    slideInLeft,
    slideInRight,
    slideOutTop,
    slideOutBottom,
    slideOutLeft,
    slideOutRight,
    zoomIn,
    zoomOut,
];
