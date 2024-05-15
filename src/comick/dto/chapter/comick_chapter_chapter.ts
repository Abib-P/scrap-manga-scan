class ComickChapterMdComics {
    id: number;
    title: string;
    country: string;
    slug: string;
    desc: string;
    links: {
        al: string;
        ap: string;
        bw: string;
        kt: string;
        mu: string;
        amz: string;
        cdj: string;
        ebj: string;
        mal: string;
        engtl: string;
    };
    genres: number[];
    hid: string;
    content_rating: string;
    chapter_numbers_reset_on_new_volume_manual: boolean;
    noindex: boolean;
    last_chapter: number;
    status: number;
    mu_comics: {
        mu_comic_publishers: {
            mu_publishers: {
                title: string;
                slug: string;
            };
        }[];
    };
    md_covers: {
        w: number;
        h: number;
        b2key: string;
    }[];
}


class ComickChapterMdImage {
    h: number;
    w: number;
    name: string;
    s: number;
    b2key: string;
    optimized: number;
}

export class ComickChapterChapter {
    id: number;
    chap: string;
    vol: string;
    title: string;
    hid: string;
    group_name: string[];
    chapter_id: string;
    created_at: string;
    updated_at: string;
    crawled_at: string;
    last_at: string;
    mdid: string;
    comment_count: number;
    up_count: number;
    down_count: number;
    status: string;
    adsense: boolean;
    lang: string;
    is_the_last_chapter: boolean;
    md_comics: ComickChapterMdComics;
    md_images: ComickChapterMdImage[];
    md_chapters_groups: any[];
}
