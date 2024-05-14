import {ComickManga} from "./comick_manga";
import {ComickMapper} from "./comick.mapper";
import {Manga} from "../common/manga/manga";
import {Partner} from "../common/partner/partner";
import {Injectable} from "@nestjs/common";
import {PartnerInfo} from "src/common/partner/partner_info";
import {ComickMangaChapters} from "./comick_manga_chapters";

@Injectable()
export class Comick implements Partner {
    private static readonly API_URL = "https://api.comick.fun";

    async search(mangaName: string): Promise<Manga[]> {
        //create variable arguments
        let UrlArguments = {
            page: '1',
            limit: '8',
            showall: 'false',
            q: mangaName,
        };
        //const query = '/v1.0/search/?page=1&limit=8&showall=false&q=' + mangaName;
        const query = '/v1.0/search/?' + new URLSearchParams(UrlArguments).toString();
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        return await fetch(Comick.API_URL + query, options)
            .then(response => response.json())
            .then(
                data => {
                    return data as ComickManga[];
                },
            ).then(
                mangas => {
                    return mangas.sort(
                        (a, b) => b.rating_count - a.rating_count
                    ).map(manga => ComickMapper.toManga(manga));
                },
            );
    }


    async download(partnerInfo: PartnerInfo): Promise<Manga> {
        //priorisé le group name "Official" si il existe sinon le premier
        //ne pas prendre les chap=null
        //https://api.comick.fun/comic/CzcseUMi/chapters

        let UrlArguments = {
            page: '1',
            lang: 'en',
            limit: '100',
            'chap-order': '1',
        };


        const query =  '/comic/' + partnerInfo.partnerCode + '/chapters?' + new URLSearchParams(UrlArguments).toString();
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        console.log(Comick.API_URL + query)

        let comickMangaChapters = await fetch(Comick.API_URL + query, options)
            .then(response => response.json())
            .then(
                data => {
                    return data as ComickMangaChapters;
                },
            ).then(
                mangaChapters => {
                    return mangaChapters.chapters.filter(chapter => chapter.chap !== null);
                },
            );

        console.log(comickMangaChapters)


        return null;
    }
}
