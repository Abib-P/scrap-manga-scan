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

        let comickMangaChapters = {};

        if (!fs.existsSync('./downloads/' + mangaName)) {
            if (!fs.existsSync('./downloads')) {
                fs.mkdirSync('./downloads');
            }
            fs.mkdirSync('./downloads/' + mangaName);
        }

        if (fs.existsSync('./downloads/' + mangaName + '/partnersInfo.json')) {
            let partnersInfo = JSON.parse(fs.readFileSync('./downloads/' + mangaName + '/partnersInfo.json').toString());
            if (partnersInfo.partnerId !== partnerInfo.partnerId || partnersInfo.partnerCode !== partnerInfo.partnerCode || partnersInfo.mangaName !== mangaName) {
                throw new Error('Partner info mismatch');
            }
        } else {
            fs.writeFileSync('./downloads/' + mangaName + '/partnersInfo.json', JSON.stringify({
                partnerId: partnerInfo.partnerId,
                partnerCode: partnerInfo.partnerCode,
                mangaName: mangaName
            }));
        }

        while (actualChapter < totalNumberOfChapters) {

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
                                    if (chapter.group_name.includes("Official")) {
                                        comickMangaChapters[+chapter.chap] = chapter;
                                    }
                                    if (comickMangaChapters[+chapter.chap] === undefined && !chapter.chap.includes('.') && chapter.chap !== "0") {
                                        comickMangaChapters[+chapter.chap] = chapter;
                                    }
                                }
                            }
                        )
                    },
                )

            actualChapter += 100;
            await new Promise(r => setTimeout(r, 250));
        }

        let chaptersImagesMap = new Map<string, string[]>();

        const ignore = fs.existsSync('./downloads/' + mangaName + '/ignore.txt') ? fs.readFileSync('./downloads/' + mangaName + '/ignore.txt').toString().split('\n') : []

        for (let chapterNumber in comickMangaChapters) {
            let chapter = comickMangaChapters[chapterNumber];
            const query = '/chapter/' + chapter.hid + '/';
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (ignore.includes(chapter.chap)) {
                console.log('Chapter ignored: ' + chapter.chap)
                continue
            }

            if (fs.existsSync('./downloads/' + mangaName + '/' + chapter.chap + '_' + chapter.hid + '.cbz')) {
                continue
            }

            if (fs.existsSync('./downloads/' + mangaName)) {
                let regex = new RegExp(chapter.chap + '_[a-zA-Z0-9]+.cbz');
                let files = fs.readdirSync('./downloads/' + mangaName);
                for (let file of files) {
                    if (regex.test(file)) {
                        fs.rmSync('./downloads/' + mangaName + '/' + file);
                        console.log('Deleted old version: ' + file)
                    }
                }
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
            console.log('Downloading: ' + chapterNumber)

            let chapterImages = chaptersImagesMap.get(chapter.chap);

            if (!fs.existsSync('./downloads/' + mangaName + '/' + chapter.chap)) {
                fs.mkdirSync('./downloads/' + mangaName + '/' + chapter.chap);
            }

            for (let image of chapterImages) {
                const imageResponse = await fetch(image);
                const buffer = await imageResponse.arrayBuffer();
                const test = Buffer.from(buffer).toString("base64")
                fs.writeFileSync('./downloads/' + mangaName + '/' + chapter.chap + '/' + image.split('/').pop(), test, 'base64');
            }

            const output = fs.createWriteStream('./downloads/' + mangaName + '/' + chapter.chap + '_' + chapter.hid + '.cbz');
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
        }
        return null
    }
}
