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
        let UrlArguments = {
            page: '1',
            limit: '8',
            showall: 'false',
            q: mangaName,
        };

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
        let UrlArguments = {
            page: '1',
            lang: 'en',
            limit: '100',
            'chap-order': '1',
        };

        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        let actualChapter = 0;
        let totalNumberOfChapters = 1;

        let comickMangaChapters = {};

        while (actualChapter < totalNumberOfChapters) {

            UrlArguments.page = (actualChapter / 100 + 1).toString();
            const query = '/comic/' + partnerInfo.partnerCode + '/chapters?' + new URLSearchParams(UrlArguments).toString();

            await fetch(Comick.API_URL + query, options)
                .then(response => response.json())
                .then(
                    data => {
                        return data as ComickMangaChapters;
                    },
                ).then(
                    mangaChapters => {
                        totalNumberOfChapters = mangaChapters.total;
                        return mangaChapters.chapters.filter(chapter => chapter.chap !== null);
                    },
                )
                .then(
                    mangaChapters => {
                        mangaChapters.forEach(
                            chapter => {
                                if (comickMangaChapters[+chapter.chap] === undefined) {
                                    comickMangaChapters[+chapter.chap] = chapter;
                                } else {
                                    if (chapter.group_name.includes("Official")) {
                                        comickMangaChapters[+chapter.chap] = chapter;
                                    }
                                }
                            }
                        )
                    },
                )

            actualChapter += 100;
        }

        console.log(comickMangaChapters);

        return null;

        for (let chapterNumber in comickMangaChapters) {
            let chapter = comickMangaChapters[chapterNumber];
            //https://api.comick.fun/chapter/wNJzw/
            const query = '/chapter/' + chapter.hid + '/';
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            let comickChapter = await fetch(Comick.API_URL + query, options)
                .then(response => response.json())
                .then(
                    data => {
                        return data;
                    },
                )
        }

        return null;
    }
}
