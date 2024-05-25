class FirstChap {
    chap: string;
    hid: string;
    lang: string;
    group_name: string[];
    vol: string;
}

class Comic {
    id: number;
    hid: string;
    title: string;
    country: string;
    status: number;
    links: {
        al: string;
        ap: string;
        bw: string;
        mu: string;
        amz: string;
        cdj: string;
        ebj: string;
        mal: string;
        engtl: string;
    };
    last_chapter: number;
    chapter_count: number;
    demographic: number;
    hentai: boolean;
    user_follow_count: number;
    follow_rank: number;
    comment_count: number;
    follow_count: number;
    desc: string;
    parsed: string;
    slug: string;
    mismatch: any;
    year: number;
    bayesian_rating: string;
    rating_count: number;
    content_rating: string;
    translation_completed: boolean;
    chapter_numbers_reset_on_new_volume_manual: boolean;
    final_chapter: string;
    final_volume: string;
    noindex: boolean;
    adsense: boolean;
    login_required: boolean;
    recommendations: {
        up: number;
        down: number;
        total: number;
        relates: {
            title: string;
            slug: string;
            hid: string;
            md_covers: {
                vol: string;
                w: number;
                h: number;
                b2key: string;
            }[];
        };
    }[];
    relate_from: {
        relate_to: {
            slug: string;
            title: string;
        };
        md_relates: {
            name: string;
        };
    }[];
    md_titles: {
        title: string;
        lang: string;
    }[];
    md_comic_md_genres: {
        md_genres: {
            name: string;
            type: string;
            slug: string;
            group: string;
        };
    }[];
    md_covers: {
        vol: string;
        w: number;
        h: number;
        b2key: string;
    }[];
    mu_comics: {
        mu_comic_publishers: {
            mu_publishers: {
                title: string;
                slug: string;
            };
        }[];
        licensed_in_english: boolean;
        mu_comic_categories: {
            mu_categories: {
                title: string;
                slug: string;
            };
            positive_vote: number;
            negative_vote: number;
        }[];
    };
}

class Artist {
    name: string;
    slug: string;
}

class Author {
    name: string;
    slug: string;
}


export class ComickMangaInfo {
    firstChap: FirstChap;
    comic: Comic;
    artists: Artist[];
    authors: Author[];
    langList: string[];
    recommendable: boolean;
    demographic: string;
    englishLink: string;
    matureContent: boolean;
    checkVol2Chap1: boolean;
}
