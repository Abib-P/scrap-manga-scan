export class ComickManga {
    id: number = 0;
    hid: string = '';
    slug: string = '';
    title: string = '';
    country: string = '';
    rating: string = '';
    bayesian_rating: string = '';
    rating_count: number = 0;
    follow_count: number = 0;
    desc: string = '';
    status: number = 0;
    last_chapter: number = 0;
    translation_completed: boolean = false;
    view_count: number = 0;
    content_rating: string = '';
    demographic: number = 0;
    uploaded_at: string = '';
    genres: number[] = [];
    created_at: string = '';
    user_follow_count: number = 0;
    year: number = 0;
    mu_comics: { year: number } = {year: 0};
    md_titles: { title: string }[] = [];
    md_covers: { w: number; h: number; b2key: string }[] = [];
    highlight: string = '';
}

