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

class PartnersInfo {
    partnerId: string;
    partnerCode: string;
    mangaName: string;
}

@Injectable()
export class ComickPartner implements Partner {
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

        return await fetch(ComickPartner.API_URL + query, options)
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

    //todo ameliorer la gestion des erreurs avec retry et meilleurs logs lors d'erreur
    //todo renvoyer une 2XX response au moment de l'appel puis lancer dans un thread le telechargement
    //todo faut-it supprimer les chapitre qui ne sont plus present sur le site ? (j'ai eu le cas qui supprimait des chapitres .5)
    async download(partnerInfo: PartnerInfo): Promise<Manga> {
        //todo decider d'un id de manga
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

        await fetch(ComickPartner.API_URL + query, options) //todo gerer les erreurs au cas ou le manga a changer d'id (déjà eu le cas)
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

        mangaName = mangaName.replace(/\//g, ' ');

        if (fs.existsSync('./downloads/')) {
            let partnersInfo = fs.readdirSync('./downloads').map(mangaName => {
                if (fs.existsSync('./downloads/' + mangaName + '/partnersInfo.json')) {
                    return JSON.parse(fs.readFileSync('./downloads/' + mangaName + '/partnersInfo.json').toString());
                }
                return null
            }).filter(partnerInfo => partnerInfo !== null) as PartnersInfo[];

            for (let partnerInfoStored of partnersInfo) {
                if (partnerInfoStored.partnerId === partnerInfo.partnerId && partnerInfoStored.partnerCode === partnerInfo.partnerCode && partnerInfoStored.mangaName !== mangaName) {
                    throw new Error('Partner info already exists. New manga name ' + mangaName + ' and stored manga name ' + partnerInfoStored.mangaName);
                    //todo: add a way to update the manga with the new partner info
                }
            }
        }

        if (!fs.existsSync('./downloads/' + mangaName)) {
            if (!fs.existsSync('./downloads')) {
                fs.mkdirSync('./downloads');
            }
            fs.mkdirSync('./downloads/' + mangaName);
        }

        console.log('' + mangaName)

        let actualChapter = 0;
        let totalNumberOfChapters = 1;

        let comickMangaChapters = {};
        let comickMangaChapterIsOfficial = {};
        let comickMangaChapterDate = {};


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

            await fetch(ComickPartner.API_URL + query, options)
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
                                if (chapter.group_name && chapter.group_name.length > 0) {
                                    if (chapter.group_name.includes("Official")) {
                                        if (comickMangaChapterIsOfficial[+chapter.chap] === 'true') {
                                            let created_at = new Date(chapter.created_at);
                                            if (created_at > comickMangaChapterDate[+chapter.chap]) {
                                                comickMangaChapters[+chapter.chap] = chapter;
                                                comickMangaChapterIsOfficial[+chapter.chap] = 'true';
                                                comickMangaChapterDate[+chapter.chap] = created_at;
                                            }
                                        } else {
                                            comickMangaChapters[+chapter.chap] = chapter;
                                            comickMangaChapterIsOfficial[+chapter.chap] = 'true';
                                            comickMangaChapterDate[+chapter.chap] = new Date(chapter.created_at);
                                        }
                                    } else if (!chapter.chap.includes('.') && chapter.chap !== "0" && comickMangaChapterIsOfficial[+chapter.chap] !== 'true') {
                                        if (comickMangaChapterIsOfficial[+chapter.chap] === 'group') {
                                            let created_at = new Date(chapter.created_at);
                                            if (created_at > comickMangaChapterDate[+chapter.chap]) {
                                                comickMangaChapters[+chapter.chap] = chapter;
                                                comickMangaChapterIsOfficial[+chapter.chap] = 'group';
                                                comickMangaChapterDate[+chapter.chap] = created_at;
                                            }
                                        } else {
                                            comickMangaChapters[+chapter.chap] = chapter;
                                            comickMangaChapterIsOfficial[+chapter.chap] = 'group';
                                            comickMangaChapterDate[+chapter.chap] = new Date(chapter.created_at);
                                        }
                                    }
                                } else {
                                    if (comickMangaChapters[+chapter.chap] === undefined && !chapter.chap.includes('.') && chapter.chap !== "0") {
                                        comickMangaChapters[+chapter.chap] = chapter;
                                        comickMangaChapterIsOfficial[+chapter.chap] = 'false';
                                        comickMangaChapterDate[+chapter.chap] = new Date(chapter.created_at);
                                    } else if (comickMangaChapterIsOfficial[+chapter.chap] === 'false' && !chapter.chap.includes('.') && chapter.chap !== "0") {
                                        let created_at = new Date(chapter.created_at);
                                        if (created_at > comickMangaChapterDate[+chapter.chap]) {
                                            comickMangaChapters[+chapter.chap] = chapter;
                                            comickMangaChapterIsOfficial[+chapter.chap] = 'false';
                                            comickMangaChapterDate[+chapter.chap] = created_at;
                                        }
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

        fs.readdirSync('./downloads/' + mangaName).forEach(file => {
            if (fs.lstatSync('./downloads/' + mangaName + '/' + file).isDirectory()) {
                fs.rmSync('./downloads/' + mangaName + '/' + file, {recursive: true});
            }
        })

        for (let chapterNumber in comickMangaChapters) {
            let chapter = comickMangaChapters[chapterNumber];
            const query = '/chapter/' + chapter.hid + '/';
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (fs.existsSync('./downloads/' + mangaName + '/' + chapter.chap)) {
                fs.rmSync('./downloads/' + mangaName + '/' + chapter.chap, {recursive: true});
            }

            if (ignore.includes(chapter.chap)) {
                console.log(mangaName + ' : chapter ' + chapter.chap + ' is ignored')
                continue
            }

            if (fs.existsSync('./downloads/' + mangaName + '/' + chapter.chap + '_' + chapter.hid + '.cbz')) {
                continue
            }

            if (fs.existsSync('./downloads/' + mangaName)) {
                let regex = new RegExp('^' + chapter.chap + '_.+\.cbz$');
                let files = fs.readdirSync('./downloads/' + mangaName);
                for (let file of files) {
                    if (regex.test(file)) {
                        fs.rmSync('./downloads/' + mangaName + '/' + file);
                        console.log('Deleted old version: ' + file)
                    }
                }
            }

            await fetch(ComickPartner.API_URL + query, options)
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
                        chaptersImagesMap.set(chapter.chapter.chap, chapter.chapter.md_images.map(image => ComickPartner.IMAGE_URL + image.b2key));
                    },
                );

            await new Promise(r => setTimeout(r, 100));
            console.log('Downloading: ' + mangaName + ' : chapter ' + chapter.chap)

            let chapterImages = chaptersImagesMap.get(chapter.chap);


            fs.mkdirSync('./downloads/' + mangaName + '/' + chapter.chap);

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

    async updateAll(): Promise<void> {
        for (let mangaName of fs.readdirSync('./downloads')) {
            if (!fs.existsSync('./downloads/' + mangaName + '/partnersInfo.json')) {
                continue
            }
            let partnersInfo = JSON.parse(fs.readFileSync('./downloads/' + mangaName + '/partnersInfo.json').toString());
            await this.download(new PartnerInfo({
                partnerId: partnersInfo.partnerId,
                partnerCode: partnersInfo.partnerCode
            }))

            await new Promise(r => setTimeout(r, 250));
        }

        console.log('All mangas updated')
        return null
    }
}
