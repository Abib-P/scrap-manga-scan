import {PartnerInfoDto} from "./partner_info.dto";


interface IMangaDto {
    mangaId?: String;
    partnersInfo: PartnerInfoDto;
    MangaTitle: string;
    MangaCoverUrl: string;
}

export class MangaDto {
    mangaId?: String;
    partnersInfo: PartnerInfoDto;
    MangaTitle: string;
    MangaCoverUrl: string;

    constructor(manga: IMangaDto) {
        this.mangaId = manga.mangaId;
        this.partnersInfo = manga.partnersInfo;
        this.MangaTitle = manga.MangaTitle;
        this.MangaCoverUrl = manga.MangaCoverUrl;
    }
}

