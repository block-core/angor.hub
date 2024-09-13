export class ScrollbarGeometry {
    constructor(
        public x: number,
        public y: number,
        public w: number,
        public h: number
    ) {}
}

export class ScrollbarPosition {
    constructor(
        public x: number | 'start' | 'end',
        public y: number | 'start' | 'end'
    ) {}
}
