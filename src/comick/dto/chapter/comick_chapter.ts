import {ComickChapterChapter} from "./comick_chapter_chapter";

class ComickChapterNextPrev {
    chap: string;
    vol: string;
    title: string;
    hid: string;
    lang: string;
    id: number;
    href: string;
}

class ComickChapterChapters {
    chap: string;
    vol: string;
    hid: string;
    lang: string;
    id: number;
    title: string;
}

class ComickDupGroupChapters {
    id: number;
    hid: string;
    chap: string;
    group_name: string[];
    md_chapters_groups: any[];
}

class ComickChapterLangList {
    lang: string;
    hid: string;
}

export class ComickChapter {
    chapter: ComickChapterChapter;
    next: ComickChapterNextPrev;
    prev: ComickChapterNextPrev;
    matureContent: boolean = false;
    chapters: ComickChapterChapters[] = [];
    dupGroupChapters: ComickDupGroupChapters[] = [];
    chapterLangList: ComickChapterLangList[] = [];
    canonical: string = '';
    seoTitle: string = '';
    seoDescription: string = '';
    chapTitle: string = '';
    checkVol2Chap1: boolean = false;
}
