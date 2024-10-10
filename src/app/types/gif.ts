export interface Gif {
    preview: string;
    size: number;
    url: string;
}

export interface TenorGif {
    gif: Gif;
    nanogif: Gif;
}

export interface TenorGifResponse {
    bg_color: string;
    composite?: string;
    content_description: string;
    content_rating: string;
    created: number;
    flags?: string[];
    h1_title: string;
    hasaudio: boolean;
    hascaption: boolean;
    id: string;
    itemurl: string;
    media: TenorGif[];
    shares: number;
    source_id: string;
    tags?: string[];
    title: string;
    url: string;
}

export interface TenorResponse {
    results: TenorGifResponse[];
    next: string;
}
