import {ComickManga} from "./dto/manga/comick_manga";
import {ComickMapper} from "./comick.mapper";
import {Manga} from "../common/manga/manga";
import {Partner} from "../common/partner/partner";
import {Injectable} from "@nestjs/common";
import {PartnerInfo} from "src/common/partner/partner_info";
import {ComickMangaChapters} from "./dto/manga/comick_manga_chapters";
import {ComickChapter} from "./dto/chapter/comick_chapter";
import * as fs from "node:fs";
import * as archiver from "archiver";
import {ComickMangaInfo} from "./dto/manga_info/comick_manga_info";

@Injectable()
export class Comick implements Partner {
    private static readonly API_URL = "https://api.comick.fun";
    private static readonly IMAGE_URL = "https://meo3.comick.pictures/";

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

        let mangaName: string = "";
        let mangaHid: string = "";

        const query = '/comic/' + partnerInfo.partnerCode + '/';

        await fetch(Comick.API_URL + query, options)
            .then(response => response.json())
            .then(
                data => {
                    return data as ComickMangaInfo;
                },
            ).then(
                mangaInfo => {
                    mangaName = mangaInfo.comic.title;
                    mangaHid = mangaInfo.comic.hid;
                },
            )


        let actualChapter = 0;
        let totalNumberOfChapters = 1;

        while (actualChapter < totalNumberOfChapters) {

            let comickMangaChapters = {};


            UrlArguments.page = (actualChapter / 100 + 1).toString();
            const query = '/comic/' + mangaHid + '/chapters?' + new URLSearchParams(UrlArguments).toString();

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
                                if (chapter.group_name) {
                                    if (comickMangaChapters[+chapter.chap] === undefined && chapter.group_name.includes("Official")) {
                                        comickMangaChapters[+chapter.chap] = chapter;
                                    }
                                }
                            }
                        )
                    },
                )

            let chaptersImagesMap = new Map<string, string[]>();

            let actualChapterImage = 0

            for (let chapterNumber in comickMangaChapters) {
                let chapter = comickMangaChapters[chapterNumber];
                const query = '/chapter/' + chapter.hid + '/';
                const options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                if (fs.existsSync('./downloads/' + mangaName + '/' + chapter.chap + '.cbz')) {
                    console.log('Already downloaded: ' + chapter.chap)
                    continue
                }

                await fetch(Comick.API_URL + query, options)
                    .then(response =>
                        response.json()
                    )
                    .then(
                        data => {
                            return data as ComickChapter;
                        },
                    )
                    .then(
                        chapter => {
                            if (mangaName === "") {
                                mangaName = chapter.chapter.md_comics.title
                            }
                            chaptersImagesMap.set(chapter.chapter.chap, chapter.chapter.md_images.map(image => Comick.IMAGE_URL + image.b2key));
                        },
                    );

                await new Promise(r => setTimeout(r, 100));
                console.log('Download: ' + chapterNumber)

                if (!fs.existsSync('./downloads')) {
                    fs.mkdirSync('./downloads');
                }

                let chapterImages = chaptersImagesMap.get(chapter.chap);

                if (!fs.existsSync('./downloads/' + mangaName + '/' + chapter.chap)) {
                    if (!fs.existsSync('./downloads/' + mangaName)) {
                        fs.mkdirSync('./downloads/' + mangaName);
                    }
                    fs.mkdirSync('./downloads/' + mangaName + '/' + chapter.chap);
                }

                for (let image of chapterImages) {
                    const imageResponse = await fetch(image);
                    const buffer = await imageResponse.arrayBuffer();
                    const test = Buffer.from(buffer).toString("base64")
                    fs.writeFileSync('./downloads/' + mangaName + '/' + chapter.chap + '/' + image.split('/').pop(), test, 'base64');
                }

                const output = fs.createWriteStream('./downloads/' + mangaName + '/' + chapter.chap + '.cbz');
                const archive = archiver('zip', {
                    zlib: {level: 9}
                });
                archive.pipe(output);
                archive.directory('./downloads/' + mangaName + '/' + chapter.chap, false);
                await archive.finalize();
                output.close()
                await new Promise(r => setTimeout(r, 250));

                fs.rm('./downloads/' + mangaName + '/' + chapter.chap, {recursive: true}, (err) => {
                    if (err) {
                        console.error(err);
                    }
                })

                if (actualChapterImage > 100) {
                    await new Promise(r => setTimeout(r, 10000))
                    actualChapterImage = 0
                }
            }
            actualChapter += 100;
        }
        return null
    }
}
