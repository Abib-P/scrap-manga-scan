import {ComickManga} from "./comick_manga";
import {Manga} from "../core/manga/manga";
import {PartnerInfo, Partners} from "../core/partner/partner_info";

export class ComickMapper {
    private static readonly MANGA_COVER_URL = "https://meo.comick.pictures/";

    static toManga(manga: ComickManga): Manga {
        return new Manga({
                mangaId: undefined,
                partnersInfo: new PartnerInfo({
                    partnerId: Partners.COMICK,
                    partnerCode: manga.hid
                }),
                MangaTitle: manga.title,
                MangaCover: this.MANGA_COVER_URL + manga.md_covers[0].b2key,
            }
        );
    }
}
