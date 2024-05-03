import {PartnerInfo} from "../partner/partner_info";
import {Id} from "../id/id";

interface IManga {
    mangaId?: Id;
    partnersInfo: PartnerInfo;
    MangaTitle: string;
    MangaCover: string;
}

export class Manga {
    mangaId?: Id;
    partnersInfo: PartnerInfo;
    MangaTitle: string;
    MangaCover: string;

    constructor(manga: IManga) {
        this.mangaId = manga.mangaId;
        this.partnersInfo = manga.partnersInfo;
        this.MangaTitle = manga.MangaTitle;
        this.MangaCover = manga.MangaCover;
    }
}
